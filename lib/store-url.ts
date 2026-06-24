import type { Store } from "@/types/domain"
import { getSiteName } from "@/lib/seo/site"

export function getStorePath(slug: string) {
  return `/c/${slug}`
}

export function getStoreUrl(slug: string, origin?: string) {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "")
  return `${base}${getStorePath(slug)}`
}

export async function copyStoreLink(url: string) {
  const { toast } = await import("sonner")
  await navigator.clipboard.writeText(url)
  toast.success("Link copied to clipboard")
}

export async function shareStoreLink(store: Store, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: store.name,
        text: `Browse ${store.name} on ${getSiteName()}`,
        url,
      })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
    }
  }
  await copyStoreLink(url)
}
