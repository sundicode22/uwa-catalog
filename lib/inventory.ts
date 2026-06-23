import type { Product } from "@/types/domain"

export function tracksInventory(
  product: Pick<Product, "inventory">
): product is Product & { inventory: number } {
  return product.inventory !== null && product.inventory !== undefined
}

export function isInStock(product: Pick<Product, "inventory">) {
  if (!tracksInventory(product)) return true
  return product.inventory > 0
}

export function getCartQuantityForProduct(
  productId: string,
  items: { product: Product; quantity: number }[]
) {
  return items
    .filter((item) => item.product.id === productId)
    .reduce((sum, item) => sum + item.quantity, 0)
}

export function getAvailableStock(
  product: Product,
  items: { product: Product; quantity: number }[]
) {
  if (!tracksInventory(product)) return Number.POSITIVE_INFINITY
  const reserved = getCartQuantityForProduct(product.id, items)
  return Math.max(0, product.inventory - reserved)
}

export function canAddToCart(
  product: Product,
  items: { product: Product; quantity: number }[],
  quantity = 1
) {
  if (!isInStock(product)) return false
  return getAvailableStock(product, items) >= quantity
}

export function getMaxCartQuantity(
  product: Product,
  items: { product: Product; quantity: number }[],
  currentLineQuantity = 0
) {
  if (!tracksInventory(product)) return Number.POSITIVE_INFINITY
  const otherLines = getCartQuantityForProduct(product.id, items) - currentLineQuantity
  return Math.max(0, product.inventory - otherLines)
}

export function formatInventoryLabel(inventory: number | null | undefined) {
  if (inventory === null || inventory === undefined) return null
  if (inventory <= 0) return "Out of stock"
  if (inventory <= 5) return `Only ${inventory} left`
  return `${inventory} in stock`
}

export function formatStockRemaining(
  product: Product,
  items: { product: Product; quantity: number }[],
  lineQuantity = 0
) {
  if (!tracksInventory(product)) return null
  const remaining = getMaxCartQuantity(product, items, lineQuantity)
  if (remaining <= 0) return "None left"
  if (remaining <= 5) return `${remaining} left`
  return `${remaining} available`
}

export function formatStockColumn(inventory: number | null | undefined) {
  if (inventory === null || inventory === undefined) return "Unlimited"
  if (inventory <= 0) return "Out of stock"
  return `${inventory} left`
}
