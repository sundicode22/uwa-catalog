import { eq } from "drizzle-orm"
import { db, stores, users } from "@/lib/db"
import { getOrderTrackingUrl } from "@/lib/order-tracking"
import { getSiteUrl } from "@/lib/seo/site"
import { whatsAppUrl } from "@/lib/whatsapp"
import type { Order } from "@/types/domain"

export async function notifyMerchantOnNewOrder(input: {
  order: Order
  storeId: string
  storeName: string
  storeSlug: string
  trackingToken: string
}) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, input.storeId))
  if (!store?.notifyOnNewOrder) return null

  const trackingUrl = getOrderTrackingUrl(
    input.storeSlug,
    input.trackingToken,
    getSiteUrl()
  )

  const message = [
    `*New order — ${input.storeName}*`,
    `Customer: ${input.order.customerName}`,
    `Phone: ${input.order.customerPhone}`,
    `Total: ${input.order.total}`,
    `Track: ${trackingUrl}`,
  ].join("\n")

  const merchantWhatsApp = store.whatsappNumber
    ? whatsAppUrl(store.whatsappNumber, message)
    : null

  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.id, store.ownerId))

  if (owner?.email && process.env.SMTP_URL) {
    console.log(
      `[order-notification] email to ${owner.email}: new order ${input.order.id}`
    )
  } else if (owner?.email) {
    console.log(
      `[order-notification] new order for ${owner.email}: ${trackingUrl}`
    )
  }

  return { trackingUrl, merchantWhatsApp }
}
