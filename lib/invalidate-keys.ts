export function storeQueryKeys(storeId: string) {
  return {
    stats: ["store-stats", storeId],
    products: ["products", storeId],
    categories: ["categories", storeId],
    orders: ["orders", storeId],
  }
}

export function storeInvalidateKeys(storeId: string) {
  const keys = storeQueryKeys(storeId)
  return [keys.stats, keys.products, keys.categories, keys.orders]
}
