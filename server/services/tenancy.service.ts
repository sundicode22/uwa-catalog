import { and, eq } from "drizzle-orm"
import { db, categories, orders, products, stores } from "@/lib/db"
import { forbidden, notFound, badRequest } from "@/server/elysia/plugins/errors"

export const tenancyService = {
  async assertStoreOwner(storeId: string, userId: string) {
    const [store] = await db
      .select({ id: stores.id, ownerId: stores.ownerId })
      .from(stores)
      .where(eq(stores.id, storeId))

    if (!store) notFound("Store not found")
    if (store.ownerId !== userId) forbidden("You do not own this store")
    return store
  },

  async getOwnedStore(storeId: string, userId: string) {
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId))
    if (!store) notFound("Store not found")
    if (store.ownerId !== userId) forbidden("You do not own this store")
    return store
  },

  async assertProductOwner(productId: string, userId: string) {
    const [product] = await db
      .select({ id: products.id, storeId: products.storeId })
      .from(products)
      .where(eq(products.id, productId))

    if (!product) notFound("Product not found")
    await tenancyService.assertStoreOwner(product.storeId, userId)
    return product
  },

  async assertCategoryOwner(categoryId: string, userId: string) {
    const [category] = await db
      .select({ id: categories.id, storeId: categories.storeId })
      .from(categories)
      .where(eq(categories.id, categoryId))

    if (!category) notFound("Category not found")
    await tenancyService.assertStoreOwner(category.storeId, userId)
    return category
  },

  async assertOrderOwner(orderId: string, userId: string) {
    const [order] = await db
      .select({ id: orders.id, storeId: orders.storeId })
      .from(orders)
      .where(eq(orders.id, orderId))

    if (!order) notFound("Order not found")
    await tenancyService.assertStoreOwner(order.storeId, userId)
    return order
  },

  async assertCategoryBelongsToStore(
    categoryId: string | null | undefined,
    storeId: string
  ) {
    if (!categoryId) return

    const [category] = await db
      .select({ id: categories.id, storeId: categories.storeId })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.storeId, storeId)))

    if (!category) badRequest("Category does not belong to this store")
  },
}
