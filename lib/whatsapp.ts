import { formatSelectionsLabel } from "@/lib/product-options"
import { formatMoney } from "@/lib/format"
import { getProductPath } from "@/lib/seo/paths"
import type { ProductSelections } from "@/types/domain"

export type WhatsAppOrderItem = {
  name: string
  displayName?: string
  price: string
  quantity: number
  productSlug?: string
  selections?: ProductSelections
}

export type WhatsAppCustomerDetails = {
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
}

export function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, "")
}

export function whatsAppUrl(phone: string, text: string) {
  const digits = normalizeWhatsAppPhone(phone)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function defaultPhoneCountry(currency?: string | null) {
  switch (currency?.trim().toUpperCase()) {
    case "XAF":
      return "CM"
    case "XOF":
      return "SN"
    case "NGN":
      return "NG"
    case "GHS":
      return "GH"
    case "KES":
      return "KE"
    case "ZAR":
      return "ZA"
    case "INR":
      return "IN"
    case "BRL":
      return "BR"
    case "MXN":
      return "MX"
    case "GBP":
      return "GB"
    case "EUR":
      return "FR"
    default:
      return "US"
  }
}

export function buildWhatsAppOrderMessage(input: {
  storeName: string
  storeSlug: string
  currency: string
  customer: WhatsAppCustomerDetails
  items: WhatsAppOrderItem[]
  total: number
  origin: string
}) {
  const lines = [
    `*New order — ${input.storeName}*`,
    "",
    "*Customer*",
    `Name: ${input.customer.name}`,
    `Phone: ${input.customer.phone}`,
  ]

  if (input.customer.email) lines.push(`Email: ${input.customer.email}`)
  if (input.customer.address) lines.push(`Address: ${input.customer.address}`)
  if (input.customer.city) lines.push(`City: ${input.customer.city}`)

  lines.push("", "*Items*")

  input.items.forEach((item, index) => {
    const label =
      item.displayName ??
      (item.selections && formatSelectionsLabel(item.selections)
        ? `${item.name} (${formatSelectionsLabel(item.selections)})`
        : item.name)
    const unitPrice = parseFloat(item.price)
    const lineTotal = unitPrice * item.quantity

    lines.push(`${index + 1}. ${label} x${item.quantity}`)
    lines.push(
      `   ${formatMoney(unitPrice, input.currency)} each · ${formatMoney(lineTotal, input.currency)}`
    )

    if (item.productSlug) {
      const productUrl = `${input.origin.replace(/\/$/, "")}${getProductPath(input.storeSlug, item.productSlug)}`
      lines.push(`   ${productUrl}`)
    }
  })

  lines.push("", `*Total:* ${formatMoney(input.total, input.currency)}`)

  return lines.join("\n")
}

function isMobileBrowser() {
  return (
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  )
}

/** Call synchronously on user click before async work so desktop popups are not blocked. */
export function prepareWhatsAppChat() {
  if (typeof window === "undefined" || isMobileBrowser()) return null
  return window.open("about:blank", "_blank", "noopener,noreferrer")
}

/** Opens WhatsApp with the prefilled message (app on mobile, web on desktop). */
export function openWhatsAppChat(
  phone: string,
  text: string,
  preparedWindow?: Window | null
) {
  const url = whatsAppUrl(phone, text)
  if (!url) {
    preparedWindow?.close()
    return false
  }

  if (isMobileBrowser()) {
    window.location.assign(url)
    return true
  }

  if (preparedWindow && !preparedWindow.closed) {
    preparedWindow.location.href = url
    return true
  }

  const popup = window.open(url, "_blank", "noopener,noreferrer")
  if (!popup) {
    window.location.assign(url)
  }
  return true
}

export function getCatalogOrigin(fallback: string) {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin
  }
  return fallback.replace(/\/$/, "")
}
