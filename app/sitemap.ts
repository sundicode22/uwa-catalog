import type { MetadataRoute } from "next"
import {
  catalogEntryPath,
  getPublicCatalogIndex,
} from "@/lib/catalog/get-public-catalog-index"
import { routing } from "@/i18n/routing"
import { absoluteUrl } from "@/lib/seo/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPublicCatalogIndex()
  const now = new Date()

  const homeUrls: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url:
      locale === routing.defaultLocale
        ? absoluteUrl("/")
        : absoluteUrl(`/${locale}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  }))

  const catalogUrls: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: absoluteUrl(catalogEntryPath(entry)),
    lastModified: entry.updatedAt,
    changeFrequency: entry.type === "product" ? "weekly" : "daily",
    priority: entry.type === "product" ? 0.8 : 0.9,
  }))

  return [...homeUrls, ...catalogUrls]
}
