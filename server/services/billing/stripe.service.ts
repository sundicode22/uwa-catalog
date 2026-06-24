import Stripe from "stripe"
import { eq } from "drizzle-orm"
import { db, users, userSubscriptions } from "@/lib/db"
import { BILLING_PLANS, type SubscriptionPlan } from "@/lib/billing/plans"
import { AppError } from "@/server/elysia/plugins/errors"
import { subscriptionService } from "@/server/services/subscription.service"

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new AppError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe billing is not configured",
      503
    )
  }
  return new Stripe(key)
}

function getPriceId(plan: SubscriptionPlan) {
  if (plan === "basic") return process.env.STRIPE_PRICE_BASIC
  if (plan === "premium") return process.env.STRIPE_PRICE_PREMIUM
  return null
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const itemEnd = sub.items?.data?.[0]?.current_period_end
  if (typeof itemEnd === "number") {
    return new Date(itemEnd * 1000)
  }
  return null
}

async function fetchSubscriptionPeriodEnd(
  stripe: Stripe,
  subscriptionId: string
): Promise<Date | null> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data"],
  })
  return periodEndFromSubscription(sub)
}

export const stripeBillingService = {
  async createCheckoutSession(userId: string, plan: SubscriptionPlan) {
    if (plan === "free") {
      throw new AppError("BAD_REQUEST", "Free plan does not require checkout", 400)
    }

    const priceId = getPriceId(plan)
    if (!priceId) {
      throw new AppError(
        "STRIPE_NOT_CONFIGURED",
        `Stripe price for ${plan} is not configured`,
        503
      )
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user?.email) {
      throw new AppError("NOT_FOUND", "User not found", 404)
    }

    const subscription = await subscriptionService.ensureForUser(userId)
    const stripe = getStripe()

    let customerId = subscription.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      })
      customerId = customer.id
      await db
        .update(userSubscriptions)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(userSubscriptions.userId, userId))
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl()}/dashboard/billing?checkout=success`,
      cancel_url: `${appUrl()}/dashboard/billing?checkout=canceled`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    })

    if (!session.url) {
      throw new AppError("STRIPE_ERROR", "Failed to create checkout session", 502)
    }

    return { url: session.url }
  },

  async createBillingPortalSession(userId: string) {
    const subscription = await subscriptionService.ensureForUser(userId)
    if (!subscription.stripeCustomerId) {
      throw new AppError(
        "NO_STRIPE_CUSTOMER",
        "No Stripe subscription found for this account",
        400
      )
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl()}/dashboard/billing`,
    })

    return { url: session.url }
  },

  async handleWebhook(rawBody: string, signature: string | null) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) {
      throw new AppError(
        "STRIPE_NOT_CONFIGURED",
        "Stripe webhook secret is not configured",
        503
      )
    }
    if (!signature) {
      throw new AppError("BAD_REQUEST", "Missing Stripe signature", 400)
    }

    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan as SubscriptionPlan | undefined
        if (!userId || !plan || plan === "free") break

        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id

        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id

        let periodEnd: Date | null = null
        if (stripeSubscriptionId) {
          periodEnd = await fetchSubscriptionPeriodEnd(stripe, stripeSubscriptionId)
        }

        await subscriptionService.activatePlan(userId, plan, "stripe", {
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodEnd: periodEnd,
        })
        break
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const plan = (sub.metadata?.plan as SubscriptionPlan | undefined) ?? "basic"
        const status = sub.status
        const periodEnd = periodEndFromSubscription(sub)

        if (status === "active" || status === "trialing") {
          await subscriptionService.activatePlan(userId, plan, "stripe", {
            stripeCustomerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
            stripeSubscriptionId: sub.id,
            currentPeriodEnd: periodEnd,
          })
        } else if (status === "past_due") {
          await db
            .update(userSubscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(userSubscriptions.userId, userId))
        } else if (status === "canceled" || status === "unpaid") {
          await db
            .update(userSubscriptions)
            .set({
              plan: "free",
              status: "canceled",
              provider: "none",
              stripeSubscriptionId: null,
              currentPeriodStart: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.userId, userId))
        }
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await db
          .update(userSubscriptions)
          .set({
            plan: "free",
            status: "canceled",
            provider: "none",
            stripeSubscriptionId: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.userId, userId))
        break
      }
    }

    return { received: true }
  },
}

export function formatPlanPriceUsd(plan: SubscriptionPlan) {
  return BILLING_PLANS[plan].monthlyPriceUsd
}
