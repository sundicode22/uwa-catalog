import { eq, and, ilike, count, desc, gte, sql, or } from "drizzle-orm"
import { db, stores, categories, products, orders } from "@/lib/db"
import { slugify, paginationMeta } from "@/server/lib/response"
import { formatSelectionsLabel } from "@/lib/product-options"
import { productOptionsService } from "./product-options.service"
import { orderItemsService } from "./order-items.service"
import { subscriptionService } from "./subscription.service"
import { tenancyService } from "./tenancy.service"
import { customerService } from "./customer.service"
import { storeTransactionService } from "./store-transaction.service"
import { serializeOrder } from "@/server/lib/serializers"
import { notFound, forbidden, badRequest } from "@/server/elysia/plugins/errors"
import type {
  CreateStoreInput,
  UpdateStoreInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateProductInput,
  UpdateProductInput,
  ProductListQuery,
  OrderListQuery,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "@/types/domain"

export const storeService = {
  async listByOwner(ownerId: string) {
    return db.select().from(stores).where(eq(stores.ownerId, ownerId))
  },

  async getById(id: string) {
    const [store] = await db.select().from(stores).where(eq(stores.id, id))
    if (!store) notFound("Store not found")
    return store
  },

  async getBySlug(slug: string) {
    const [store] = await db.select().from(stores).where(eq(stores.slug, slug))
    if (!store) notFound("Store not found")
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.storeId, store.id))
      .orderBy(categories.sortOrder)
    return { ...store, categories: cats }
  },

  async create(ownerId: string, input: CreateStoreInput) {
    await subscriptionService.assertCanCreateStore(ownerId)
    let slug = slugify(input.name)
    const existing = await db.select().from(stores).where(eq(stores.slug, slug))
    if (existing.length > 0) slug = `${slug}-${Date.now()}`

    const [store] = await db
      .insert(stores)
      .values({
        ownerId,
        name: input.name,
        slug,
        description: input.description,
        whatsappNumber: input.whatsappNumber,
      })
      .returning()
    return store
  },

  async update(id: string, ownerId: string, input: UpdateStoreInput) {
    await storeService.assertOwner(id, ownerId)

    if (input.storefrontTier === "premium") {
      await subscriptionService.assertCanUsePremiumStorefront(ownerId)
    }

    const [store] = await db
      .update(stores)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning()

    if (input.currency) {
      await db
        .update(products)
        .set({ currency: input.currency, updatedAt: new Date() })
        .where(eq(products.storeId, id))
    }

    return store
  },

  async assertOwner(storeId: string, userId: string) {
    return tenancyService.getOwnedStore(storeId, userId)
  },

  async getStats(storeId: string, ownerId: string) {
    await storeService.assertOwner(storeId, ownerId)

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      [productCount],
      [activeProductCount],
      [categoryCount],
      [orderCount],
      [ordersThisWeek],
      [revenueRow],
      statusCounts,
      trendRows,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(products)
        .where(eq(products.storeId, storeId)),
      db
        .select({ count: count() })
        .from(products)
        .where(and(eq(products.storeId, storeId), eq(products.isActive, true))),
      db
        .select({ count: count() })
        .from(categories)
        .where(eq(categories.storeId, storeId)),
      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.storeId, storeId)),
      db
        .select({ count: count() })
        .from(orders)
        .where(and(eq(orders.storeId, storeId), gte(orders.createdAt, weekAgo))),
      db
        .select({
          total: sql<string>`coalesce(sum(${orders.total}::numeric), 0)::text`,
        })
        .from(orders)
        .where(eq(orders.storeId, storeId)),
      db
        .select({ status: orders.status, count: count() })
        .from(orders)
        .where(eq(orders.storeId, storeId))
        .groupBy(orders.status),
      db
        .select({
          day: sql<string>`date_trunc('day', ${orders.createdAt})::date`,
          orders: count(),
          revenue: sql<string>`coalesce(sum(${orders.total}::numeric), 0)::text`,
        })
        .from(orders)
        .where(and(eq(orders.storeId, storeId), gte(orders.createdAt, weekAgo)))
        .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
        .orderBy(sql`date_trunc('day', ${orders.createdAt})`),
    ])

    const statusMap = Object.fromEntries(
      statusCounts.map((row) => [row.status, row.count])
    ) as Record<string, number>

    const trendByDay = new Map(
      trendRows.map((row) => [
        row.day,
        { orders: row.orders, revenue: row.revenue },
      ])
    )

    const ordersTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - index))
      const key = date.toISOString().slice(0, 10)
      const point = trendByDay.get(key)
      return {
        date: key,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        orders: point?.orders ?? 0,
        revenue: point?.revenue ?? "0",
      }
    })

    const orderStatusBreakdown = (
      ["pending", "confirmed", "fulfilled", "cancelled"] as const
    ).map((status) => ({
      status,
      count: statusMap[status] ?? 0,
    }))

    return {
      totalProducts: productCount.count,
      activeProducts: activeProductCount.count,
      totalCategories: categoryCount.count,
      totalOrders: orderCount.count,
      pendingOrders: statusMap.pending ?? 0,
      confirmedOrders: statusMap.confirmed ?? 0,
      fulfilledOrders: statusMap.fulfilled ?? 0,
      cancelledOrders: statusMap.cancelled ?? 0,
      ordersThisWeek: ordersThisWeek.count,
      totalRevenue: revenueRow.total,
      ordersTrend,
      orderStatusBreakdown,
    }
  },
}

export const categoryService = {
  async listByStore(storeId: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.storeId, storeId))
      .orderBy(categories.sortOrder)
  },

  async create(userId: string, input: CreateCategoryInput) {
    await tenancyService.assertStoreOwner(input.storeId, userId)
    let slug = slugify(input.name)
    const [category] = await db
      .insert(categories)
      .values({
        storeId: input.storeId,
        name: input.name,
        slug,
      })
      .returning()
    return category
  },

  async update(id: string, userId: string, input: UpdateCategoryInput) {
    await tenancyService.assertCategoryOwner(id, userId)

    const [category] = await db
      .update(categories)
      .set({
        ...input,
        ...(input.name ? { slug: slugify(input.name) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning()
    return category
  },

  async delete(id: string, userId: string) {
    await tenancyService.assertCategoryOwner(id, userId)
    await db.delete(categories).where(eq(categories.id, id))
    return { id }
  },
}

export const productService = {
  isPublicListQuery(query: ProductListQuery = {}) {
    return query.isActive === true
  },

  async list(
    storeId: string,
    query: ProductListQuery = {},
    userId?: string | null
  ) {
    if (!productService.isPublicListQuery(query)) {
      if (!userId) forbidden("You do not own this store")
      await tenancyService.assertStoreOwner(storeId, userId)
    }
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit

    const conditions = [eq(products.storeId, storeId)]
    if (query.categoryId) {
      conditions.push(eq(products.categoryId, query.categoryId))
    }
    if (query.search) {
      conditions.push(
        or(
          ilike(products.name, `%${query.search}%`),
          ilike(products.description, `%${query.search}%`)
        )!
      )
    }
    if (query.isActive !== undefined) {
      conditions.push(eq(products.isActive, query.isActive))
    }
    if (query.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, query.isFeatured))
    }

    const where = and(...conditions)

    const [totalResult] = await db
      .select({ count: count() })
      .from(products)
      .where(where)

    const items = await db
      .select({
        id: products.id,
        storeId: products.storeId,
        categoryId: products.categoryId,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        currency: products.currency,
        images: products.images,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        inventory: products.inventory,
        sortOrder: products.sortOrder,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset)

    const productIds = items.map((row) => row.id)
    const countsMap = await productOptionsService.getCounts(productIds)

    return {
      items: items.map((row) => ({
        id: row.id,
        storeId: row.storeId,
        categoryId: row.categoryId,
        name: row.name,
        slug: row.slug,
        description: row.description,
        price: row.price,
        currency: row.currency,
        images: row.images ?? [],
        optionCounts: countsMap[row.id] ?? {
          sizes: 0,
          variationGroups: 0,
          modifierGroups: 0,
        },
        isActive: row.isActive,
        isFeatured: row.isFeatured,
        inventory: row.inventory,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        category: row.category,
      })),
      meta: paginationMeta(page, limit, totalResult.count),
    }
  },

  async getById(id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
    if (!product) notFound("Product not found")
    return product
  },

  async getBySlug(storeId: string, slug: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.slug, slug)))
    if (!product) notFound("Product not found")
    return product
  },

  async getOptions(id: string) {
    await productService.getById(id)
    return productOptionsService.load(id)
  },

  async create(userId: string, input: CreateProductInput) {
    await subscriptionService.assertCanCreateProduct(userId, input.storeId)
    await tenancyService.assertStoreOwner(input.storeId, userId)
    await tenancyService.assertCategoryBelongsToStore(
      input.categoryId,
      input.storeId
    )
    const store = await storeService.getById(input.storeId)
    const slug = slugify(input.name)
    const [product] = await db
      .insert(products)
      .values({
        storeId: input.storeId,
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        currency: store.currency ?? "USD",
        images: input.images ?? [],
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        inventory: input.inventory ?? null,
      })
      .returning()

    if (input.sizes?.length || input.variations?.length || input.modifiers?.length) {
      await productOptionsService.sync(product.id, {
        sizes: input.sizes ?? [],
        variations: input.variations ?? [],
        modifiers: input.modifiers ?? [],
      })
    }

    return product
  },

  async update(id: string, userId: string, input: UpdateProductInput) {
    const existing = await tenancyService.assertProductOwner(id, userId)
    await tenancyService.assertCategoryBelongsToStore(
      input.categoryId,
      existing.storeId
    )
    const store = await storeService.getById(existing.storeId)

    const { sizes, variations, modifiers, currency: _currency, ...productFields } = input

    const [product] = await db
      .update(products)
      .set({
        ...productFields,
        currency: store.currency ?? "USD",
        ...(input.name ? { slug: slugify(input.name) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    if (
      sizes !== undefined ||
      variations !== undefined ||
      modifiers !== undefined
    ) {
      await productOptionsService.sync(id, {
        sizes: sizes ?? [],
        variations: variations ?? [],
        modifiers: modifiers ?? [],
      })
    }

    return product
  },

  async delete(id: string, userId: string) {
    await tenancyService.assertProductOwner(id, userId)
    await db.delete(products).where(eq(products.id, id))
    return { id }
  },
}

export const orderService = {
  async list(
    storeId: string,
    userId: string,
    query: OrderListQuery = {}
  ) {
    await tenancyService.assertStoreOwner(storeId, userId)
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit

    const conditions = [eq(orders.storeId, storeId)]
    if (query.status) {
      conditions.push(eq(orders.status, query.status))
    }
    if (query.search) {
      conditions.push(
        or(
          ilike(orders.customerName, `%${query.search}%`),
          ilike(orders.customerPhone, `%${query.search}%`)
        )!
      )
    }

    const where = and(...conditions)

    const [totalResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(where)

    const orderRows = await db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    const itemsMap = await orderItemsService.loadByOrderIds(
      orderRows.map((order) => order.id)
    )

    return {
      items: orderRows.map((order) =>
        serializeOrder(order, itemsMap[order.id] ?? [])
      ),
      meta: paginationMeta(page, limit, totalResult.count),
    }
  },

  async create(input: CreateOrderInput) {
    const store = await storeService.getById(input.storeId)
    if (!store.isPublished) {
      badRequest("This store is not accepting orders")
    }
    const total = input.items
      .reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      )
      .toFixed(2)

    const quantityByProduct = new Map<string, number>()
    for (const item of input.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity
      )
    }

    for (const [productId, quantity] of quantityByProduct) {
      const [product] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.storeId, store.id)))

      if (!product) badRequest("One or more products are no longer available")
      if (!product.isActive) badRequest("One or more products are no longer available")
      if (product.inventory !== null && product.inventory < quantity) {
        badRequest(`Insufficient stock for ${product.name}`)
      }
    }

    const customer = await customerService.upsertFromOrder(input.storeId, {
      name: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail,
      address: input.customerAddress,
      city: input.customerCity,
      region: input.customerRegion,
      notes: input.customerNotes,
      orderTotal: total,
    })

    const [order] = await db
      .insert(orders)
      .values({
        storeId: input.storeId,
        customerId: customer.id,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        total,
        source: input.source ?? (store.orderMode === "whatsapp" ? "whatsapp" : "checkout"),
      })
      .returning()

    await orderItemsService.insertMany(order.id, input.items)

    await storeTransactionService.createForOrder({
      storeId: input.storeId,
      orderId: order.id,
      customerId: customer.id,
      amount: total,
      currency: store.currency ?? "USD",
      source: order.source,
      orderStatus: order.status,
    })

    for (const [productId, quantity] of quantityByProduct) {
      await db
        .update(products)
        .set({
          inventory: sql`${products.inventory} - ${quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(eq(products.id, productId), sql`${products.inventory} IS NOT NULL`)
        )
    }

    const itemsMap = await orderItemsService.loadByOrderIds([order.id])
    return serializeOrder(order, itemsMap[order.id] ?? [])
  },

  async updateStatus(id: string, userId: string, input: UpdateOrderStatusInput) {
    await tenancyService.assertOrderOwner(id, userId)
    const [order] = await db
      .update(orders)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning()

    await storeTransactionService.syncStatusForOrder(order.id, order.status)

    const itemsMap = await orderItemsService.loadByOrderIds([order.id])
    return serializeOrder(order, itemsMap[order.id] ?? [])
  },

  buildWhatsAppMessage(
    storeName: string,
    customerName: string,
    customerPhone: string,
    items: CreateOrderInput["items"]
  ) {
    const lines = [
      `*New Order for ${storeName}*`,
      ``,
      `Customer: ${customerName}`,
      `Phone: ${customerPhone}`,
      ``,
      `*Items:*`,
      ...items.map((item) => {
        const label =
          item.displayName ??
          (item.selections
            ? `${item.name} (${formatSelectionsLabel(item.selections)})`
            : item.name)
        return `- ${label} x${item.quantity} @ ${item.price}`
      }),
      ``,
      `*Total:* ${items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0).toFixed(2)}`,
    ]
    return lines.join("\n")
  },
}
