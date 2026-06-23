import type { MetadataRoute } from "next"
import {
  catalogEntryPath,
  getPublicCatalogIndex,
} from "@/lib/catalog/get-public-catalog-index"
import { absoluteUrl } from "@/lib/seo/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPublicCatalogIndex()

  const catalogUrls: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: absoluteUrl(catalogEntryPath(entry)),
    lastModified: entry.updatedAt,
    changeFrequency: entry.type === "product" ? "weekly" : "daily",
    priority: entry.type === "product" ? 0.8 : 0.9,
  }))

  return [
    ...catalogUrls,
  ]
}
