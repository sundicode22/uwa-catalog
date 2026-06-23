import { db, stores, categories } from "@/lib/db"
import { eq } from "drizzle-orm"
import type { StoreWithCategories } from "@/types/domain"

export async function getStoreBySlug(
  slug: string
): Promise<StoreWithCategories | null> {
  const [store] = await db.select().from(stores).where(eq(stores.slug, slug))
  if (!store) return null

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.storeId, store.id))
    .orderBy(categories.sortOrder)

  return {
    ...store,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
    categories: cats.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  }
}
