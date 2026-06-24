import { count, eq } from "drizzle-orm"
import { db, products, stores, userSubscriptions } from "@/lib/db"
import {
  BILLING_PLANS,
  getPlanLimits,
  type SubscriptionPlan,
} from "@/lib/billing/plans"
import { AppError } from "@/server/elysia/plugins/errors"

export type SubscriptionStatus = "active" | "past_due" | "canceled"
export type BillingProvider = "none" | "stripe" | "notchpay"

function isSubscriptionActive(
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
  currentPeriodEnd: Date | null
) {
  if (plan === "free") return true
  if (status === "canceled") return false
  if (status === "past_due") return false
  if (currentPeriodEnd && currentPeriodEnd.getTime() < Date.now()) return false
  return status === "active"
}

function effectivePlan(
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
  currentPeriodEnd: Date | null
): SubscriptionPlan {
  return isSubscriptionActive(plan, status, currentPeriodEnd) ? plan : "free"
}

export const subscriptionService = {
  async ensureForUser(userId: string) {
    const [existing] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))

    if (existing) return existing

    const [created] = await db
      .insert(userSubscriptions)
      .values({ userId })
      .returning()

    return created
  },

  async getSubscription(userId: string) {
    return subscriptionService.ensureForUser(userId)
  },

  async getEffectivePlan(userId: string): Promise<SubscriptionPlan> {
    const sub = await subscriptionService.ensureForUser(userId)
    return effectivePlan(sub.plan, sub.status, sub.currentPeriodEnd)
  },

  async getUsage(userId: string) {
    const userStores = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.ownerId, userId))

    const storeCount = userStores.length
    const productsByStore: Record<string, number> = {}

    await Promise.all(
      userStores.map(async (store) => {
        const [row] = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.storeId, store.id))
        productsByStore[store.id] = row?.count ?? 0
      })
    )

    return { storeCount, productsByStore }
  },

  async getBillingSummary(userId: string) {
    const subscription = await subscriptionService.ensureForUser(userId)
    const plan = effectivePlan(
      subscription.plan,
      subscription.status,
      subscription.currentPeriodEnd
    )
    const usage = await subscriptionService.getUsage(userId)

    return {
      subscription: {
        ...subscription,
        plan,
        currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
      },
      usage,
      plans: Object.values(BILLING_PLANS),
      limits: getPlanLimits(plan),
    }
  },

  planLimitError(
    resource: "stores" | "products",
    plan: SubscriptionPlan,
    limit: number,
    usage: number
  ): never {
    throw new AppError(
      "PLAN_LIMIT",
      resource === "stores"
        ? `Your ${BILLING_PLANS[plan].name} plan allows up to ${limit} store${limit === 1 ? "" : "s"}. Upgrade to add more.`
        : `Your ${BILLING_PLANS[plan].name} plan allows up to ${limit} products per store. Upgrade to add more.`,
      402,
      {
        resource: [resource],
        limit: [String(limit)],
        usage: [String(usage)],
        plan: [plan],
      }
    )
  },

  async assertCanCreateStore(userId: string) {
    const plan = await subscriptionService.getEffectivePlan(userId)
    const { maxStores } = getPlanLimits(plan)
    const { storeCount } = await subscriptionService.getUsage(userId)

    if (storeCount >= maxStores) {
      subscriptionService.planLimitError("stores", plan, maxStores, storeCount)
    }
  },

  async assertCanCreateProduct(userId: string, storeId: string) {
    const plan = await subscriptionService.getEffectivePlan(userId)
    const { maxProductsPerStore } = getPlanLimits(plan)
    const usage = await subscriptionService.getUsage(userId)
    const productCount = usage.productsByStore[storeId] ?? 0

    if (productCount >= maxProductsPerStore) {
      subscriptionService.planLimitError(
        "products",
        plan,
        maxProductsPerStore,
        productCount
      )
    }
  },

  async assertCanUsePremiumStorefront(userId: string) {
    const plan = await subscriptionService.getEffectivePlan(userId)
    if (plan !== "premium") {
      throw new AppError(
        "PLAN_FEATURE",
        "Premium storefront layouts require the Premium plan.",
        402,
        { feature: ["premium_storefront"], plan: [plan] }
      )
    }
  },

  async activatePlan(
    userId: string,
    plan: SubscriptionPlan,
    provider: BillingProvider,
    options?: {
      stripeCustomerId?: string | null
      stripeSubscriptionId?: string | null
      notchpayCustomerRef?: string | null
      currentPeriodEnd?: Date | null
    }
  ) {
    const now = new Date()
    const periodEnd =
      options?.currentPeriodEnd ??
      (plan === "free" ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))

    await subscriptionService.ensureForUser(userId)

    const [updated] = await db
      .update(userSubscriptions)
      .set({
        plan,
        status: "active",
        provider,
        stripeCustomerId: options?.stripeCustomerId ?? null,
        stripeSubscriptionId: options?.stripeSubscriptionId ?? null,
        notchpayCustomerRef: options?.notchpayCustomerRef ?? null,
        currentPeriodStart: plan === "free" ? null : now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: now,
      })
      .where(eq(userSubscriptions.userId, userId))
      .returning()

    return updated
  },
}
