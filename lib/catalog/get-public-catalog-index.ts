import { db, products, stores } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import { getProductPath, getStorePath } from "@/lib/seo/paths"

export type PublicCatalogEntry =
  | {
      type: "store"
      storeSlug: string
      updatedAt: Date
    }
  | {
      type: "product"
      storeSlug: string
      productSlug: string
      updatedAt: Date
    }

export async function getPublicCatalogIndex(): Promise<PublicCatalogEntry[]> {
  const publishedStores = await db
    .select({
      id: stores.id,
      slug: stores.slug,
      updatedAt: stores.updatedAt,
    })
    .from(stores)
    .where(eq(stores.isPublished, true))

  const entries: PublicCatalogEntry[] = publishedStores.map((store) => ({
    type: "store",
    storeSlug: store.slug,
    updatedAt: store.updatedAt,
  }))

  for (const store of publishedStores) {
    const storeProducts = await db
      .select({
        slug: products.slug,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(and(eq(products.storeId, store.id), eq(products.isActive, true)))

    for (const product of storeProducts) {
      entries.push({
        type: "product",
        storeSlug: store.slug,
        productSlug: product.slug,
        updatedAt: product.updatedAt,
      })
    }
  }

  return entries
}

export function catalogEntryPath(entry: PublicCatalogEntry) {
  if (entry.type === "store") return getStorePath(entry.storeSlug)
  return getProductPath(entry.storeSlug, entry.productSlug)
}
