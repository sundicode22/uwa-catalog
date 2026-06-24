export function storeQueryKeys(storeId: string) {
  return {
    stats: ["store-stats", storeId],
    products: ["products", storeId],
    categories: ["categories", storeId],
    orders: ["orders", storeId],
    customers: ["customers", storeId],
    transactions: ["transactions", storeId],
  }
}

export function storeInvalidateKeys(storeId: string) {
  const keys = storeQueryKeys(storeId)
  return [
    keys.stats,
    keys.products,
    keys.categories,
    keys.orders,
    keys.customers,
    keys.transactions,
  ]
}
