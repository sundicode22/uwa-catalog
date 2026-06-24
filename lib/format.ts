import { resolveStoreCurrency } from "@/lib/currency"

function normalizeCurrency(currency?: string) {
  return resolveStoreCurrency(currency ? { currency } : null)
}

export function formatMoney(value: string | number, currency = "USD") {
  const amount = typeof value === "string" ? parseFloat(value) : value
  if (Number.isNaN(amount)) return "—"

  const code = normalizeCurrency(currency)

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

export function getCurrencySymbol(currency = "USD") {
  const code = normalizeCurrency(currency)
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0)
    return parts.find((p) => p.type === "currency")?.value ?? code
  } catch {
    return "$"
  }
}

export function formatMoneyCompact(value: string | number, currency = "USD") {
  const amount = typeof value === "string" ? parseFloat(value) : value
  if (Number.isNaN(amount)) return "—"

  const code = normalizeCurrency(currency)
  const symbol = getCurrencySymbol(code)
  const abs = Math.abs(amount)

  if (abs >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`
  }

  return formatMoney(amount, code)
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatRelativeDate(value: string) {
  const date = new Date(value)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
