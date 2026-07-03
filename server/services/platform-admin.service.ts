import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm"
import {
  catalogPageViews,
  db,
  orders,
  stores,
  users,
  walletAccounts,
  withdrawalRequests,
} from "@/lib/db"
import { platformSettingsService } from "@/server/services/platform-settings.service"

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export const platformAdminService = {
  async getOverviewMetrics() {
    const since7d = daysAgo(7)
    const since30d = daysAgo(30)

    const [
      [userCount],
      [storeCount],
      [publishedStoreCount],
      [orders7d],
      [orders30d],
      [pendingWithdrawals],
      [walletLiabilities],
      [pageViews7d],
      [uniqueVisitors7d],
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(stores),
      db
        .select({ count: count() })
        .from(stores)
        .where(eq(stores.isPublished, true)),
      db
        .select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, since7d)),
      db
        .select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, since30d)),
      db
        .select({ count: count() })
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.status, "pending")),
      db
        .select({
          total: sql<number>`coalesce(sum(${walletAccounts.availableBalance} + ${walletAccounts.pendingBalance}), 0)::int`,
        })
        .from(walletAccounts),
      db
        .select({ count: count() })
        .from(catalogPageViews)
        .where(gte(catalogPageViews.createdAt, since7d)),
      db
        .select({
          count: sql<number>`count(distinct ${catalogPageViews.visitorId})::int`,
        })
        .from(catalogPageViews)
        .where(gte(catalogPageViews.createdAt, since7d)),
    ])

    const paidOrders = await db
      .select({ total: orders.total, createdAt: orders.createdAt })
      .from(orders)
      .where(
        and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, since30d))
      )

    const gmv30d = paidOrders.reduce(
      (sum, row) => sum + (parseFloat(row.total) || 0),
      0
    )

    const ordersTrend = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, since7d))
      .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
      .orderBy(sql`date_trunc('day', ${orders.createdAt})`)

    return {
      users: userCount.count,
      stores: storeCount.count,
      publishedStores: publishedStoreCount.count,
      orders7d: orders7d.count,
      orders30d: orders30d.count,
      gmv30d,
      pendingWithdrawals: pendingWithdrawals.count,
      walletLiabilitiesMinor: walletLiabilities.total ?? 0,
      pageViews7d: pageViews7d.count,
      uniqueVisitors7d: uniqueVisitors7d.count ?? 0,
      ordersTrend: ordersTrend.map((row) => ({
        day: row.day,
        count: row.count,
      })),
    }
  },

  async listUsers(query: { page?: number; limit?: number; search?: string } = {}) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const offset = (page - 1) * limit

    const conditions = []
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`
      conditions.push(or(ilike(users.email, term), ilike(users.name, term))!)
    }

    const where = conditions.length ? and(...conditions) : undefined

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        storeCount: sql<number>`(
          select count(*)::int from stores where stores.owner_id = ${users.id}
        )`,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: count() })
      .from(users)
      .where(where)

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.createdAt.toISOString(),
        storeCount: row.storeCount,
      })),
      meta: {
        page,
        limit,
        total: countResult?.count ?? 0,
        totalPages: Math.ceil((countResult?.count ?? 0) / limit),
      },
    }
  },

  async listStores(query: { page?: number; limit?: number; search?: string } = {}) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const offset = (page - 1) * limit

    const conditions = []
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`
      conditions.push(or(ilike(stores.name, term), ilike(stores.slug, term))!)
    }

    const where = conditions.length ? and(...conditions) : undefined

    const rows = await db
      .select({
        store: stores,
        ownerEmail: users.email,
        ownerName: users.name,
        orderCount: sql<number>`(
          select count(*)::int from orders where orders.store_id = ${stores.id}
        )`,
        visitorCount7d: sql<number>`(
          select count(*)::int from catalog_page_views
          where catalog_page_views.store_id = ${stores.id}
          and catalog_page_views.created_at >= ${daysAgo(7)}
        )`,
      })
      .from(stores)
      .innerJoin(users, eq(stores.ownerId, users.id))
      .where(where)
      .orderBy(desc(stores.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: count() })
      .from(stores)
      .where(where)

    return {
      items: rows.map((row) => ({
        id: row.store.id,
        name: row.store.name,
        slug: row.store.slug,
        isPublished: row.store.isPublished,
        currency: row.store.currency,
        ownerEmail: row.ownerEmail,
        ownerName: row.ownerName,
        orderCount: row.orderCount,
        visitorCount7d: row.visitorCount7d,
        createdAt: row.store.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total: countResult?.count ?? 0,
        totalPages: Math.ceil((countResult?.count ?? 0) / limit),
      },
    }
  },

  async getVisitorMetrics(query: {
    storeId?: string
    days?: number
  } = {}) {
    const days = query.days ?? 7
    const since = daysAgo(days)

    const conditions = [gte(catalogPageViews.createdAt, since)]
    if (query.storeId) {
      conditions.push(eq(catalogPageViews.storeId, query.storeId))
    }

    const where = and(...conditions)

    const [totals] = await db
      .select({
        pageViews: count(),
        uniqueVisitors: sql<number>`count(distinct ${catalogPageViews.visitorId})::int`,
      })
      .from(catalogPageViews)
      .where(where)

    const topStores = await db
      .select({
        storeId: catalogPageViews.storeId,
        storeName: stores.name,
        storeSlug: stores.slug,
        views: sql<number>`count(*)::int`,
      })
      .from(catalogPageViews)
      .innerJoin(stores, eq(catalogPageViews.storeId, stores.id))
      .where(where)
      .groupBy(catalogPageViews.storeId, stores.name, stores.slug)
      .orderBy(desc(sql`count(*)`))
      .limit(10)

    const topPages = await db
      .select({
        storeId: catalogPageViews.storeId,
        path: catalogPageViews.path,
        views: sql<number>`count(*)::int`,
      })
      .from(catalogPageViews)
      .where(where)
      .groupBy(catalogPageViews.storeId, catalogPageViews.path)
      .orderBy(desc(sql`count(*)`))
      .limit(10)

    return {
      days,
      pageViews: totals?.pageViews ?? 0,
      uniqueVisitors: totals?.uniqueVisitors ?? 0,
      topStores: topStores.map((row) => ({
        storeId: row.storeId,
        storeName: row.storeName,
        storeSlug: row.storeSlug,
        views: row.views,
      })),
      topPages: topPages.map((row) => ({
        storeId: row.storeId,
        path: row.path,
        views: row.views,
      })),
    }
  },

  async getSettings() {
    return platformSettingsService.getSettings()
  },

  async updateSettings(input: {
    platformFeePercent?: number
    minWithdrawalAmount?: number
  }) {
    return platformSettingsService.updateSettings(input)
  },
}
