import { randomBytes } from "crypto"
import type { categories, products, stores, orders, storeCustomers, storeTransactions } from "@/lib/db"
import { getOrderTrackingUrl } from "@/lib/order-tracking"
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
  items: OrderItem[],
  extras?: {
    storeSlug?: string
    trackingUrl?: string
    checkoutUrl?: string | null
    merchantWhatsAppUrl?: string | null
  }
) {
  const trackingToken = order.trackingToken ?? ""
  return {
    id: order.id,
    storeId: order.storeId,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    items,
    subtotal: order.subtotal ?? order.total,
    deliveryFee: order.deliveryFee ?? "0",
    discountCode: order.discountCode ?? null,
    discountAmount: order.discountAmount ?? "0",
    total: order.total,
    fulfillmentType: order.fulfillmentType ?? "pickup",
    paymentStatus: order.paymentStatus ?? "not_required",
    trackingToken,
    trackingUrl:
      extras?.trackingUrl ??
      (extras?.storeSlug && trackingToken
        ? getOrderTrackingUrl(extras.storeSlug, trackingToken)
        : undefined),
    checkoutUrl: extras?.checkoutUrl ?? null,
    merchantWhatsAppUrl: extras?.merchantWhatsAppUrl ?? null,
    status: order.status,
    source: order.source,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

export function serializeStoreCustomer(
  customer: typeof storeCustomers.$inferSelect
) {
  return {
    id: customer.id,
    storeId: customer.storeId,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    region: customer.region,
    notes: customer.notes,
    totalOrders: customer.totalOrders,
    totalSpent: customer.totalSpent,
    lastOrderAt: customer.lastOrderAt?.toISOString() ?? null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }
}

export function serializeStoreTransaction(
  transaction: typeof storeTransactions.$inferSelect,
  customer?: { name: string; phone: string }
) {
  return {
    id: transaction.id,
    storeId: transaction.storeId,
    orderId: transaction.orderId,
    customerId: transaction.customerId,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    reference: transaction.reference,
    notes: transaction.notes,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    ...(customer
      ? { customerName: customer.name, customerPhone: customer.phone }
      : {}),
  }
}
