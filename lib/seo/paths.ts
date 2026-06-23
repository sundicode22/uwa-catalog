export function getStorePath(storeSlug: string) {
  return `/c/${storeSlug}`
}

export function getProductPath(storeSlug: string, productSlug: string) {
  return `/c/${storeSlug}/products/${productSlug}`
}
