import { getSiteUrl } from "@/lib/seo/site"

export function getOrderTrackingPath(storeSlug: string, trackingToken: string) {
  return `/c/${storeSlug}/orders/${trackingToken}`
}

export function getOrderTrackingUrl(
  storeSlug: string,
  trackingToken: string,
  origin?: string
) {
  const base = (origin ?? getSiteUrl()).replace(/\/$/, "")
  return `${base}${getOrderTrackingPath(storeSlug, trackingToken)}`
}
