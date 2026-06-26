import type { DiscountCode, FulfillmentType } from "@/types/domain"

export function calculateSubtotal(
  items: { price: string; quantity: number }[]
) {
  return items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  )
}

export function calculateDeliveryFee(input: {
  subtotal: number
  fulfillmentType: FulfillmentType
  deliveryEnabled: boolean
  deliveryFee: string
  freeDeliveryMinimum?: string | null
}) {
  if (input.fulfillmentType !== "delivery" || !input.deliveryEnabled) return 0
  const fee = parseFloat(input.deliveryFee || "0")
  if (!Number.isFinite(fee) || fee <= 0) return 0
  const minimum = input.freeDeliveryMinimum
    ? parseFloat(input.freeDeliveryMinimum)
    : null
  if (minimum !== null && Number.isFinite(minimum) && input.subtotal >= minimum) {
    return 0
  }
  return fee
}

export function calculateDiscountAmount(input: {
  subtotal: number
  code?: DiscountCode | null
}) {
  if (!input.code) return 0
  const value = parseFloat(input.code.value)
  if (!Number.isFinite(value) || value <= 0) return 0
  if (input.code.minOrderTotal) {
    const min = parseFloat(input.code.minOrderTotal)
    if (Number.isFinite(min) && input.subtotal < min) return 0
  }
  if (input.code.type === "percent") {
    return Math.min(input.subtotal, (input.subtotal * value) / 100)
  }
  return Math.min(input.subtotal, value)
}

export function calculateOrderTotal(input: {
  subtotal: number
  deliveryFee: number
  discountAmount: number
}) {
  return Math.max(0, input.subtotal + input.deliveryFee - input.discountAmount)
}
