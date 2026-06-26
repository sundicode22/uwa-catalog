import { notFound } from "next/navigation"
import { OrderTrackingClient } from "@/components/catalog/order-tracking-client"
import { getStoreBySlug } from "@/lib/catalog/get-store-by-slug"
import { orderService } from "@/server/services"

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ storeSlug: string; token: string }>
}) {
  const { storeSlug, token } = await params
  const store = await getStoreBySlug(storeSlug)
  if (!store) notFound()

  try {
    const order = await orderService.getByTrackingToken(storeSlug, token)
    return <OrderTrackingClient store={store} order={order} />
  } catch {
    notFound()
  }
}
