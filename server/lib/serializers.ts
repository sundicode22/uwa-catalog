import type { categories, products, stores, orders } from "@/lib/db"
import type { OrderItem, ProductOptionCounts } from "@/types/domain"

export function serializeStore(store: typeof stores.$inferSelect) {
  return {
    ...store,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  }
}

export function serializeCategory(category: typeof categories.$inferSelect) {
  return {
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}

export function serializeProductSummary(
  product: typeof products.$inferSelect,
  optionCounts?: ProductOptionCounts
) {
  return {
    id: product.id,
    storeId: product.storeId,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    currency: product.currency,
    images: product.images ?? [],
    optionCounts: optionCounts ?? {
      sizes: 0,
      variationGroups: 0,
      modifierGroups: 0,
    },
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    inventory: product.inventory,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

/** @deprecated Use serializeProductSummary */
export function serializeProduct(product: typeof products.$inferSelect) {
  return serializeProductSummary(product)
}

export function serializeOrder(
  order: typeof orders.$inferSelect,
  items: OrderItem[]
) {
  return {
    id: order.id,
    storeId: order.storeId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    items,
    total: order.total,
    status: order.status,
    source: order.source,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
