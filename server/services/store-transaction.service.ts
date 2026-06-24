import { and, count, desc, eq, ilike, or } from "drizzle-orm"
import { db, storeCustomers, storeTransactions } from "@/lib/db"
import { paginationMeta } from "@/server/lib/response"
import { tenancyService } from "@/server/services/tenancy.service"
import type { OrderSource, OrderStatus, TransactionListQuery } from "@/types/domain"

function transactionStatusForOrder(status: OrderStatus) {
  switch (status) {
    case "confirmed":
    case "fulfilled":
      return "completed" as const
    case "cancelled":
      return "voided" as const
    default:
      return "pending" as const
  }
}

function paymentMethodForSource(source: OrderSource) {
  return source === "whatsapp" ? "whatsapp" : "catalog_checkout"
}

export const storeTransactionService = {
  async createForOrder(input: {
    storeId: string
    orderId: string
    customerId: string
    amount: string
    currency: string
    source: OrderSource
    orderStatus: OrderStatus
  }) {
    const [transaction] = await db
      .insert(storeTransactions)
      .values({
        storeId: input.storeId,
        orderId: input.orderId,
        customerId: input.customerId,
        type: "sale",
        status: transactionStatusForOrder(input.orderStatus),
        amount: input.amount,
        currency: input.currency,
        paymentMethod: paymentMethodForSource(input.source),
        reference: input.orderId,
      })
      .returning()

    return transaction
  },

  async syncStatusForOrder(orderId: string, orderStatus: OrderStatus) {
    const [updated] = await db
      .update(storeTransactions)
      .set({
        status: transactionStatusForOrder(orderStatus),
        updatedAt: new Date(),
      })
      .where(eq(storeTransactions.orderId, orderId))
      .returning()

    return updated ?? null
  },

  async list(storeId: string, userId: string, query: TransactionListQuery = {}) {
    await tenancyService.assertStoreOwner(storeId, userId)

    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit

    const conditions = [eq(storeTransactions.storeId, storeId)]

    if (query.status) {
      conditions.push(eq(storeTransactions.status, query.status))
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`
      conditions.push(
        or(
          ilike(storeCustomers.name, term),
          ilike(storeCustomers.phone, term),
          ilike(storeTransactions.reference, term),
          ilike(storeTransactions.paymentMethod, term)
        )!
      )
    }

    const where = and(...conditions)

    const [totalResult] = await db
      .select({ count: count() })
      .from(storeTransactions)
      .innerJoin(
        storeCustomers,
        eq(storeTransactions.customerId, storeCustomers.id)
      )
      .where(where)

    const rows = await db
      .select({
        transaction: storeTransactions,
        customerName: storeCustomers.name,
        customerPhone: storeCustomers.phone,
      })
      .from(storeTransactions)
      .innerJoin(
        storeCustomers,
        eq(storeTransactions.customerId, storeCustomers.id)
      )
      .where(where)
      .orderBy(desc(storeTransactions.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      items: rows.map((row) => ({
        ...row.transaction,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
      })),
      meta: paginationMeta(page, limit, totalResult.count),
    }
  },
}
