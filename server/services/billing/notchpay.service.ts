import { createHmac, timingSafeEqual } from "crypto"
import { and, eq } from "drizzle-orm"
import { billingCustomers, billingTransactions, db, users } from "@/lib/db"
import { BILLING_PLANS, type SubscriptionPlan } from "@/lib/billing/plans"
import { AppError } from "@/server/elysia/plugins/errors"
import { subscriptionService } from "@/server/services/subscription.service"
import { NotchPayAPI, normalizeNotchPayPayment } from "./notchpay-sdk"

const appUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

const getSecretKey = () => {
  const key =
    process.env.NOTCHPAY_PRIVATE_KEY ??
    process.env.NOTCHPAY_SECRET_KEY ??
    process.env.NOTCHPAY_PUBLIC_KEY
  if (!key) {
    throw new AppError(
      "NOTCHPAY_NOT_CONFIGURED",
      "NotchPay secret key is not configured",
      503
    )
  }
  return key
}

const getWebhookSecret = () => {
  return process.env.NOTCHPAY_WEBHOOK_SECRET ?? process.env.NOTCHPAY_HASH_SECRET
}

const getNotchPay = () => {
  return new NotchPayAPI(getSecretKey())
}

const parseSubscriptionReference = (reference: string) => {
  const match = /^sub_([^_]+)_([^_]+)_(\d+)$/.exec(reference)
  if (!match) return null
  const [, userId, plan, timestamp] = match
  if (!["basic", "premium"].includes(plan)) return null
  return {
    userId,
    plan: plan as SubscriptionPlan,
    timestamp,
  }
}

const verifySignature = (payload: string, signature: string | null) => {
  const secret = getWebhookSecret()
  if (!secret || !signature) return false

  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8")
    )
  } catch {
    return expected === signature
  }
}

const mapTransactionStatus = (status?: string) => {
  switch (status) {
    case "complete":
      return "complete" as const
    case "failed":
      return "failed" as const
    case "canceled":
      return "canceled" as const
    case "expired":
      return "expired" as const
    case "processing":
      return "processing" as const
    default:
      return "pending" as const
  }
}

const processPaymentResult = async (
  reference: string,
  userId: string,
  plan: SubscriptionPlan,
  payment: ReturnType<typeof normalizeNotchPayPayment>["raw"]
) => {
  const { transaction, authorizationUrl } = normalizeNotchPayPayment(payment)
  const paymentReference = transaction?.reference ?? reference
  const status = mapTransactionStatus(transaction?.status)
  const amount = transaction?.amount ?? BILLING_PLANS[plan].monthlyPriceXaf
  const currency = transaction?.currency ?? "XAF"

  await notchpayBillingService.upsertCustomer({
    userId,
    email: transaction?.customer?.email ?? null,
    name: transaction?.customer?.name ?? null,
    externalCustomerId: transaction?.customer?.id ?? null,
    externalReference: paymentReference,
    metadata: payment as Record<string, unknown>,
  })

  await notchpayBillingService.upsertTransaction({
    userId,
    plan,
    amount,
    currency,
    reference: paymentReference,
    status,
    externalTransactionId: transaction?.id ?? null,
    externalCustomerId: transaction?.customer?.id ?? null,
    checkoutUrl: authorizationUrl,
    paymentMethod: transaction?.payment_method ?? null,
    paidAt: status === "complete" ? new Date() : null,
    lastPayload: payment as Record<string, unknown>,
  })

  if (status === "complete") {
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await subscriptionService.activatePlan(userId, plan, "notchpay", {
      notchpayCustomerRef: paymentReference,
      currentPeriodEnd: periodEnd,
    })
  }

  return { status, reference: paymentReference, plan, authorizationUrl }
}

export const notchpayBillingService = {
  async upsertCustomer(input: {
    userId: string
    email?: string | null
    name?: string | null
    externalCustomerId?: string | null
    externalReference?: string | null
    metadata?: Record<string, unknown> | null
  }) {
    const [existing] = await db
      .select()
      .from(billingCustomers)
      .where(
        and(
          eq(billingCustomers.userId, input.userId),
          eq(billingCustomers.provider, "notchpay")
        )
      )

    if (existing) {
      const [updated] = await db
        .update(billingCustomers)
        .set({
          email: input.email ?? existing.email,
          name: input.name ?? existing.name,
          externalCustomerId: input.externalCustomerId ?? existing.externalCustomerId,
          externalReference: input.externalReference ?? existing.externalReference,
          metadata: input.metadata ?? existing.metadata,
          updatedAt: new Date(),
        })
        .where(eq(billingCustomers.id, existing.id))
        .returning()
      return updated
    }

    const [created] = await db
      .insert(billingCustomers)
      .values({
        userId: input.userId,
        provider: "notchpay",
        email: input.email ?? null,
        name: input.name ?? null,
        externalCustomerId: input.externalCustomerId ?? null,
        externalReference: input.externalReference ?? null,
        metadata: input.metadata ?? null,
      })
      .returning()

    return created
  },

  async upsertTransaction(input: {
    userId: string
    plan: SubscriptionPlan
    amount: number
    currency: string
    reference: string
    status: "pending" | "processing" | "complete" | "failed" | "canceled" | "expired"
    externalTransactionId?: string | null
    externalCustomerId?: string | null
    checkoutUrl?: string | null
    paymentMethod?: string | null
    paidAt?: Date | null
    lastPayload?: Record<string, unknown> | null
  }) {
    const [existing] = await db
      .select()
      .from(billingTransactions)
      .where(eq(billingTransactions.externalReference, input.reference))

    if (existing) {
      const [updated] = await db
        .update(billingTransactions)
        .set({
          status: input.status,
          amount: input.amount,
          currency: input.currency,
          externalTransactionId:
            input.externalTransactionId ?? existing.externalTransactionId,
          externalCustomerId: input.externalCustomerId ?? existing.externalCustomerId,
          checkoutUrl: input.checkoutUrl ?? existing.checkoutUrl,
          paymentMethod: input.paymentMethod ?? existing.paymentMethod,
          paidAt: input.paidAt ?? existing.paidAt,
          lastPayload: input.lastPayload ?? existing.lastPayload,
          updatedAt: new Date(),
        })
        .where(eq(billingTransactions.id, existing.id))
        .returning()
      return updated
    }

    const [created] = await db
      .insert(billingTransactions)
      .values({
        userId: input.userId,
        provider: "notchpay",
        plan: input.plan,
        status: input.status,
        amount: input.amount,
        currency: input.currency,
        externalTransactionId: input.externalTransactionId ?? null,
        externalCustomerId: input.externalCustomerId ?? null,
        externalReference: input.reference,
        checkoutUrl: input.checkoutUrl ?? null,
        paymentMethod: input.paymentMethod ?? null,
        paidAt: input.paidAt ?? null,
        lastPayload: input.lastPayload ?? null,
      })
      .returning()

    return created
  },

  async createPayment(userId: string, plan: SubscriptionPlan) {
    if (plan === "free") {
      throw new AppError("BAD_REQUEST", "Free plan does not require payment", 400)
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user?.email) {
      throw new AppError("NOT_FOUND", "User not found", 404)
    }

    const amount = BILLING_PLANS[plan].monthlyPriceXaf
    const reference = `sub_${userId}_${plan}_${Date.now()}`
    const callback = `${appUrl()}/dashboard/billing?checkout=notchpay&reference=${encodeURIComponent(reference)}`
    const notchpay = getNotchPay()

    const payment = await notchpay.payments.create({
      amount,
      currency: "XAF",
      customer: {
        name: user.name ?? user.email,
        email: user.email,
      },
      description: `${BILLING_PLANS[plan].name} plan subscription`,
      reference,
      callback,
    })

    const { transaction, authorizationUrl } = normalizeNotchPayPayment(payment)
    const paymentReference = transaction?.reference ?? reference

    if (!authorizationUrl) {
      throw new AppError(
        "NOTCHPAY_ERROR",
        "NotchPay did not return a checkout URL",
        502
      )
    }

    await notchpayBillingService.upsertCustomer({
      userId,
      email: transaction?.customer?.email ?? user.email,
      name: transaction?.customer?.name ?? user.name ?? user.email,
      externalCustomerId: transaction?.customer?.id ?? null,
      externalReference: paymentReference,
      metadata: { source: "subscription_checkout" },
    })

    await notchpayBillingService.upsertTransaction({
      userId,
      plan,
      amount,
      currency: "XAF",
      reference: paymentReference,
      status: mapTransactionStatus(transaction?.status),
      externalTransactionId: transaction?.id ?? null,
      externalCustomerId: transaction?.customer?.id ?? null,
      checkoutUrl: authorizationUrl,
      paymentMethod: transaction?.payment_method ?? null,
      lastPayload: payment as Record<string, unknown>,
    })

    return {
      paymentId: transaction?.id ?? null,
      reference: paymentReference,
      url: authorizationUrl,
    }
  },

  async verifyPayment(reference: string, userId: string) {
    const parsed = parseSubscriptionReference(reference)
    if (!parsed) {
      throw new AppError("BAD_REQUEST", "Invalid payment reference", 400)
    }
    if (parsed.userId !== userId) {
      throw new AppError("FORBIDDEN", "Payment does not belong to this account", 403)
    }

    const payment = await getNotchPay().payments.retrieve(reference)
    return processPaymentResult(reference, userId, parsed.plan, payment)
  },

  async getPayment(reference: string) {
    return getNotchPay().payments.retrieve(reference)
  },

  async handleWebhook(rawBody: string, signature: string | null) {
    if (!verifySignature(rawBody, signature)) {
      throw new AppError("INVALID_SIGNATURE", "Invalid NotchPay signature", 400)
    }

    const event = JSON.parse(rawBody) as {
      type?: string
      data?: {
        amount?: number
        currency?: string
        reference?: string
        status?: string
        transaction?: {
          id?: string
          reference?: string
          status?: string
          amount?: number
          currency?: string
          customer?: {
            id?: string
            email?: string
            name?: string
          }
          payment_method?: string
        }
      }
    }

    if (
      event.type !== "payment.complete" &&
      event.type !== "payment.failed" &&
      event.type !== "payment.expired" &&
      event.type !== "payment.canceled"
    ) {
      return { received: true }
    }

    const reference = event.data?.transaction?.reference ?? event.data?.reference
    if (!reference) {
      return { received: true }
    }

    const parsed = parseSubscriptionReference(reference)
    if (!parsed) {
      return { received: true }
    }

    const payment = await notchpayBillingService.getPayment(reference)
    await processPaymentResult(reference, parsed.userId, parsed.plan, payment)

    return { received: true }
  },
}
