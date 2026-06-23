export function truncateText(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export function buildProductDescription(
  productName: string,
  storeName: string,
  description?: string | null
) {
  if (description?.trim()) return truncateText(description)
  return truncateText(`Shop ${productName} at ${storeName}. Browse pricing and order online.`)
}

export function buildStoreDescription(
  storeName: string,
  description?: string | null
) {
  if (description?.trim()) return truncateText(description)
  return truncateText(
    `Browse the ${storeName} catalog. Discover products, prices, and order online.`
  )
}
