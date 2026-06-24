import { createHmac, timingSafeEqual } from "crypto"
import { and, eq, or } from "drizzle-orm"
import { billingCustomers, billingTransactions, db, users } from "@/lib/db"
import { type SubscriptionPlan } from "@/lib/billing/plans"
import { planService } from "@/server/services/billing/plan.service"
import { AppError } from "@/server/elysia/plugins/errors"
import { subscriptionService } from "@/server/services/subscription.service"

const DEFAULT_NOTCHPAY_API_URL = "https://api.notchpay.co"

type NotchPayTransaction = {
  id?: string
  reference?: string
  status?: string
  currency?: string
  amount?: number
  customer?: {
    id?: string
    email?: string
    name?: string
  }
  payment_method?: string
}

type NotchPayPaymentResponse = {
  authorization_url?: string
  authorizationUrl?: string
  transaction?: NotchPayTransaction
  payment?: {
    authorization_url?: string
    transaction?: NotchPayTransaction
  }
  data?: NotchPayTransaction & {
    authorization_url?: string
  }
  message?: string
  error?: { message?: string }
  code?: number | string
}

const getApiUrl = () =>
  (process.env.NOTCHPAY_API_URL ?? DEFAULT_NOTCHPAY_API_URL).replace(/\/$/, "")

const appUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

const getPublicKey = () => {
  const key = process.env.NOTCHPAY_PUBLIC_KEY
  if (!key) {
    throw new AppError(
      "NOTCHPAY_NOT_CONFIGURED",
      "NotchPay public key is not configured",
      503
    )
  }
  return key
}

const getWebhookSecret = () => {
  return process.env.NOTCHPAY_WEBHOOK_SECRET ?? process.env.NOTCHPAY_HASH_SECRET
}

const normalizeNotchPayPayment = (payload: NotchPayPaymentResponse) => {
  const transaction =
    payload.transaction ??
    payload.payment?.transaction ??
    (payload.data
      ? {
          id: payload.data.id,
          reference: payload.data.reference,
          status: payload.data.status,
          currency: payload.data.currency,
          amount: payload.data.amount,
          customer:
            typeof payload.data.customer === "string"
              ? { id: payload.data.customer }
              : payload.data.customer,
          payment_method: payload.data.payment_method,
        }
      : null)
  const authorizationUrl =
    payload.authorization_url ??
    payload.authorizationUrl ??
    payload.payment?.authorization_url ??
    payload.data?.authorization_url ??
    null

  return { transaction, authorizationUrl, raw: payload }
}

const notchpayFetch = async (
  path: string,
  init: RequestInit
): Promise<NotchPayPaymentResponse> => {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: getPublicKey(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

  let data: NotchPayPaymentResponse = {}
  try {
    data = (await response.json()) as NotchPayPaymentResponse
  } catch {
    data = {}
  }

  const responseCode =
    typeof data.code === "string" ? Number.parseInt(data.code, 10) : data.code

  if (!response.ok) {
    throw new AppError(
      "NOTCHPAY_ERROR",
      data.message ??
        data.error?.message ??
        `NotchPay request failed (${response.status})`,
      response.status === 404 ? 404 : 502
    )
  }

  if (
    responseCode &&
    !Number.isNaN(responseCode) &&
    (responseCode < 200 || responseCode >= 300)
  ) {
    throw new AppError(
      "NOTCHPAY_ERROR",
      data.message ??
        data.error?.message ??
        `NotchPay request failed (code ${responseCode})`,
      502
    )
  }

  return data
}

const createNotchPayPayment = (input: {
  amount: number
  currency: string
  customer: { email: string; name?: string; phone?: string }
  reference: string
  callback: string
  description: string
}) =>
  notchpayFetch("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  })

const retrieveNotchPayPayment = (reference: string) =>
  notchpayFetch(`/payments/${encodeURIComponent(reference)}`, { method: "GET" })

const isMerchantReference = (ref: string) => ref.startsWith("sub_")

export type NotchPayCallbackParams = {
  merchantRef: string | null
  paymentRef: string | null
  statusHint: string | null
}

export const resolveCallbackParams = (
  input: Record<string, string | undefined> | string
): NotchPayCallbackParams => {
  if (typeof input === "string") {
    const url = new URL(input)
    const references = url.searchParams
      .getAll("reference")
      .map((value) => value.trim())
      .filter(Boolean)

    const merchantRef =
      url.searchParams.get("notchpay_trxref")?.trim() ||
      url.searchParams.get("trxref")?.trim() ||
      references.find(isMerchantReference) ||
      null

    const paymentRef =
      references.find((value) => !isMerchantReference(value)) ||
      url.searchParams.get("payment_reference")?.trim() ||
      null

    return {
      merchantRef,
      paymentRef,
      statusHint: url.searchParams.get("status")?.trim().toLowerCase() ?? null,
    }
  }

  const merchantRef =
    input.notchpay_trxref?.trim() ||
    input.trxref?.trim() ||
    (input.reference && isMerchantReference(input.reference)
      ? input.reference.trim()
      : null) ||
    null

  const paymentRef =
    (input.reference && !isMerchantReference(input.reference)
      ? input.reference.trim()
      : null) ||
    (input.payment_reference?.trim() ?? null)

  return {
    merchantRef,
    paymentRef,
    statusHint: input.status?.trim().toLowerCase() ?? null,
  }
}

const resolveCallbackCheckout = (
  status: ReturnType<typeof mapTransactionStatus>
) => {
  if (status === "complete") return "success"
  if (status === "failed" || status === "canceled" || status === "expired") {
    return "failed"
  }
  return "pending"
}

const lookupMerchantReference = async (paymentRef: string) => {
  const [tx] = await db
    .select({ externalReference: billingTransactions.externalReference })
    .from(billingTransactions)
    .where(
      and(
        eq(billingTransactions.provider, "notchpay"),
        or(
          eq(billingTransactions.externalReference, paymentRef),
          eq(billingTransactions.externalTransactionId, paymentRef)
        )
      )
    )
    .limit(1)

  return tx?.externalReference && isMerchantReference(tx.externalReference)
    ? tx.externalReference
    : null
}

const retrieveNotchPayPaymentByRefs = async (input: {
  merchantRef?: string | null
  paymentRef?: string | null
}) => {
  const candidates = new Set<string>()

  if (input.paymentRef) candidates.add(input.paymentRef)
  if (input.merchantRef) candidates.add(input.merchantRef)

  if (input.merchantRef) {
    const [tx] = await db
      .select({
        externalReference: billingTransactions.externalReference,
        externalTransactionId: billingTransactions.externalTransactionId,
      })
      .from(billingTransactions)
      .where(
        and(
          eq(billingTransactions.provider, "notchpay"),
          eq(billingTransactions.externalReference, input.merchantRef)
        )
      )
      .limit(1)

    if (tx?.externalTransactionId) candidates.add(tx.externalTransactionId)
    if (
      tx?.externalReference &&
      !isMerchantReference(tx.externalReference)
    ) {
      candidates.add(tx.externalReference)
    }
  }

  let lastError: AppError | null = null

  for (const ref of candidates) {
    try {
      return await retrieveNotchPayPayment(ref)
    } catch (error) {
      if (error instanceof AppError) lastError = error
    }
  }

  throw (
    lastError ??
    new AppError(
      "NOTCHPAY_ERROR",
      "Payment not found. Try again in a moment.",
      502
    )
  )
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
  merchantRef: string,
  userId: string,
  plan: SubscriptionPlan,
  payment: ReturnType<typeof normalizeNotchPayPayment>["raw"]
) => {
  const { transaction, authorizationUrl } = normalizeNotchPayPayment(payment)
  const paymentReference = merchantRef
  const status = mapTransactionStatus(transaction?.status)
  const planDefinition = await planService.getPlan(plan)
  const amount = transaction?.amount ?? planDefinition.monthlyPriceXaf
  const currency = transaction?.currency ?? "XAF"
  const externalTransactionId =
    transaction?.id ??
    (transaction?.reference && transaction.reference !== merchantRef
      ? transaction.reference
      : null)

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
    externalTransactionId,
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

    const planDefinition = await planService.getPlan(plan)
    const amount = planDefinition.monthlyPriceXaf
    const reference = `sub_${userId}_${plan}_${Date.now()}`
    const callback = `${appUrl()}/api/billing/notchpay/callback`

    const payment = await createNotchPayPayment({
      amount,
      currency: "XAF",
      customer: {
        name: user.name ?? user.email,
        email: user.email,
      },
      description: `${planDefinition.name} plan subscription`,
      reference,
      callback,
    })

    const { transaction, authorizationUrl } = normalizeNotchPayPayment(payment)
    const externalTransactionId =
      (transaction?.reference && !isMerchantReference(transaction.reference)
        ? transaction.reference
        : null) ??
      transaction?.id ??
      null

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
      externalReference: reference,
      metadata: { source: "subscription_checkout" },
    })

    await notchpayBillingService.upsertTransaction({
      userId,
      plan,
      amount,
      currency: "XAF",
      reference,
      status: mapTransactionStatus(transaction?.status),
      externalTransactionId,
      externalCustomerId: transaction?.customer?.id ?? null,
      checkoutUrl: authorizationUrl,
      paymentMethod: transaction?.payment_method ?? null,
      lastPayload: payment as Record<string, unknown>,
    })

    return {
      paymentId: externalTransactionId,
      reference,
      url: authorizationUrl,
    }
  },

  async verifyPayment(
    reference: string,
    userId: string,
    paymentReference?: string
  ) {
    let merchantRef = isMerchantReference(reference) ? reference : null
    let paymentRef = paymentReference ?? null

    if (!merchantRef && paymentRef) {
      merchantRef = await lookupMerchantReference(paymentRef)
    }
    if (!merchantRef && !isMerchantReference(reference)) {
      paymentRef = paymentRef ?? reference
      merchantRef = await lookupMerchantReference(paymentRef)
    }
    if (!merchantRef && isMerchantReference(reference)) {
      merchantRef = reference
    }
    if (!paymentRef && reference && !isMerchantReference(reference)) {
      paymentRef = reference
    }

    if (!merchantRef) {
      throw new AppError("BAD_REQUEST", "Invalid payment reference", 400)
    }

    const parsed = parseSubscriptionReference(merchantRef)
    if (!parsed) {
      throw new AppError("BAD_REQUEST", "Invalid payment reference", 400)
    }
    if (parsed.userId !== userId) {
      throw new AppError("FORBIDDEN", "Payment does not belong to this account", 403)
    }

    const payment = await retrieveNotchPayPaymentByRefs({
      merchantRef,
      paymentRef,
    })
    return processPaymentResult(merchantRef, userId, parsed.plan, payment)
  },

  async handleCallback(input: Record<string, string | undefined> | string) {
    let { merchantRef, paymentRef, statusHint } = resolveCallbackParams(input)

    if (!merchantRef && paymentRef) {
      merchantRef = await lookupMerchantReference(paymentRef)
    }

    if (!merchantRef) {
      return {
        redirectTo: `${appUrl()}/dashboard/billing?checkout=failed`,
      }
    }

    const parsed = parseSubscriptionReference(merchantRef)
    if (!parsed) {
      return {
        redirectTo: `${appUrl()}/dashboard/billing?checkout=failed`,
      }
    }

    try {
      const payment = await retrieveNotchPayPaymentByRefs({
        merchantRef,
        paymentRef,
      })
      const result = await processPaymentResult(
        merchantRef,
        parsed.userId,
        parsed.plan,
        payment
      )
      return {
        redirectTo: `${appUrl()}/dashboard/billing?checkout=${resolveCallbackCheckout(result.status)}`,
      }
    } catch (error) {
      console.warn("[notchpay callback] verify failed:", error)
      if (statusHint === "complete") {
        return {
          redirectTo: `${appUrl()}/dashboard/billing?checkout=pending`,
        }
      }
      return {
        redirectTo: `${appUrl()}/dashboard/billing?checkout=failed`,
      }
    }
  },

  async getPayment(reference: string) {
    if (isMerchantReference(reference)) {
      return retrieveNotchPayPaymentByRefs({ merchantRef: reference })
    }
    return retrieveNotchPayPaymentByRefs({ paymentRef: reference })
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

    const reference =
      event.data?.transaction?.reference ?? event.data?.reference
    if (!reference) {
      return { received: true }
    }

    const merchantRef = isMerchantReference(reference)
      ? reference
      : await lookupMerchantReference(reference)
    if (!merchantRef) {
      return { received: true }
    }

    const parsed = parseSubscriptionReference(merchantRef)
    if (!parsed) {
      return { received: true }
    }

    const payment = await retrieveNotchPayPaymentByRefs({
      merchantRef,
      paymentRef: isMerchantReference(reference) ? null : reference,
    })
    await processPaymentResult(
      merchantRef,
      parsed.userId,
      parsed.plan,
      payment
    )

    return { received: true }
  },
}
