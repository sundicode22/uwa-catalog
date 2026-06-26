"use client"

import { Link } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { CheckCircle2Icon, ClockIcon, PackageCheckIcon, XCircleIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { whatsAppUrl } from "@/lib/whatsapp"
import type { Order, StoreWithCategories } from "@/types/domain"

const statusMeta = {
  pending: { label: "Pending", icon: ClockIcon, variant: "secondary" as const },
  confirmed: { label: "Confirmed", icon: CheckCircle2Icon, variant: "default" as const },
  fulfilled: { label: "Fulfilled", icon: PackageCheckIcon, variant: "default" as const },
  cancelled: { label: "Cancelled", icon: XCircleIcon, variant: "destructive" as const },
}

export function OrderTrackingClient({
  store,
  order,
}: {
  store: StoreWithCategories
  order: Order
}) {
  const searchParams = useSearchParams()
  const paid = searchParams.get("paid")
  const meta = statusMeta[order.status]
  const StatusIcon = meta.icon

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Order status</h1>
        <p className="text-sm text-muted-foreground">{store.name}</p>
      </div>

      {paid === "1" ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Payment received. Your order is being processed.
        </div>
      ) : paid === "0" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment was not completed. Contact the store if you need help.
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={meta.variant} className="gap-1">
            <StatusIcon className="size-3.5" />
            {meta.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Customer:</span> {order.customerName}
          </p>
          <p>
            <span className="text-muted-foreground">Phone:</span> {order.customerPhone}
          </p>
          <p>
            <span className="text-muted-foreground">Fulfillment:</span>{" "}
            {order.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}
          </p>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          {order.items.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="flex justify-between gap-3 text-sm">
              <span>
                {item.displayName ?? item.name} x{item.quantity}
              </span>
              <span className="tabular-nums whitespace-nowrap">
                {formatMoney(parseFloat(item.price) * item.quantity, store.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(order.subtotal, store.currency)}</span>
          </div>
          {parseFloat(order.deliveryFee) > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatMoney(order.deliveryFee, store.currency)}</span>
            </div>
          ) : null}
          {parseFloat(order.discountAmount) > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Discount{order.discountCode ? ` (${order.discountCode})` : ""}
              </span>
              <span>-{formatMoney(order.discountAmount, store.currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.total, store.currency)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href={`/c/${store.slug}`}>Back to store</Link>
        </Button>
        {store.whatsappNumber ? (
          <Button asChild>
            <a
              href={
                whatsAppUrl(
                  store.whatsappNumber,
                  `Hi ${store.name}, I have a question about my order.`
                ) ?? "#"
              }
              target="_blank"
              rel="noreferrer"
            >
              Contact store
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
