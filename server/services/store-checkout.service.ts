import { eq } from "drizzle-orm"
import { db, orders, stores } from "@/lib/db"
import { AppError } from "@/server/elysia/plugins/errors"

const DEFAULT_NOTCHPAY_API_URL = "https://api.notchpay.co"

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

const getPublicKey = () => {
  const key = process.env.NOTCHPAY_PUBLIC_KEY
  if (!key) {
    throw new AppError(
      "NOTCHPAY_NOT_CONFIGURED",
      "NotchPay is not configured for storefront payments",
      503
    )
  }
  return key
}

const getApiUrl = () =>
  (process.env.NOTCHPAY_API_URL ?? DEFAULT_NOTCHPAY_API_URL).replace(/\/$/, "")

const isOrderReference = (ref: string) => ref.startsWith("order_")

async function notchpayFetch(path: string, init: RequestInit) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: getPublicKey(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    throw new AppError(
      "NOTCHPAY_ERROR",
      (data.message as string) ?? `NotchPay request failed (${response.status})`,
      response.status === 404 ? 404 : 502
    )
  }
  return data
}

function extractCheckoutUrl(payload: Record<string, unknown>) {
  const data = payload.data as Record<string, unknown> | undefined
  const payment = payload.payment as Record<string, unknown> | undefined
  return (
    (payload.authorization_url as string | undefined) ??
    (payload.authorizationUrl as string | undefined) ??
    (payment?.authorization_url as string | undefined) ??
    (data?.authorization_url as string | undefined) ??
    null
  )
}

export const storeCheckoutService = {
  async createPayment(input: {
    orderId: string
    storeId: string
    amount: string
    currency: string
    customerName: string
    customerPhone: string
    customerEmail?: string
  }) {
    const reference = `order_${input.orderId}_${Date.now()}`
    const callback = `${appUrl()}/api/checkout/notchpay/callback`

    const payload = await notchpayFetch("/payments", {
      method: "POST",
      body: JSON.stringify({
        amount: Math.round(parseFloat(input.amount)),
        currency: input.currency,
        customer: {
          name: input.customerName,
          email: input.customerEmail ?? `${input.customerPhone.replace(/\D/g, "")}@checkout.sundiii.local`,
          phone: input.customerPhone,
        },
        description: `Order ${input.orderId.slice(0, 8)}`,
        reference,
        callback,
      }),
    })

    const checkoutUrl = extractCheckoutUrl(payload)
    if (!checkoutUrl) {
      throw new AppError(
        "NOTCHPAY_ERROR",
        "NotchPay did not return a checkout URL",
        502
      )
    }

    await db
      .update(orders)
      .set({
        paymentReference: reference,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, input.orderId))

    return { reference, checkoutUrl }
  },

  async handleCallback(search: string) {
    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`)
    const refs = params.getAll("reference").filter(Boolean)
    const merchantRef =
      params.get("trxref") ??
      params.get("notchpay_trxref") ??
      refs.find(isOrderReference) ??
      null

    if (!merchantRef || !isOrderReference(merchantRef)) {
      return `${appUrl()}/checkout/failed`
    }

    const orderId = merchantRef.split("_")[1]
    if (!orderId) return `${appUrl()}/checkout/failed`

    const payment = await notchpayFetch(
      `/payments/${encodeURIComponent(merchantRef)}`,
      { method: "GET" }
    )

    const transaction =
      (payment.transaction as Record<string, unknown> | undefined) ??
      (payment.data as Record<string, unknown> | undefined)
    const status = String(transaction?.status ?? params.get("status") ?? "").toLowerCase()

    if (["complete", "completed", "success", "successful", "paid"].includes(status)) {
      const [order] = await db
        .update(orders)
        .set({
          paymentStatus: "paid",
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning()

      if (order) {
        const [store] = await db
          .select()
          .from(stores)
          .where(eq(stores.id, order.storeId))
        if (store) {
          return `${appUrl()}/c/${store.slug}/orders/${order.trackingToken}?paid=1`
        }
      }
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId))
    if (order?.trackingToken) {
      const [store] = await db
        .select()
        .from(stores)
        .where(eq(stores.id, order.storeId))
      if (store) {
        return `${appUrl()}/c/${store.slug}/orders/${order.trackingToken}?paid=0`
      }
    }

    return `${appUrl()}/checkout/failed`
  },
}
