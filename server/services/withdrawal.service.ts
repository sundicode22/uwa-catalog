import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db, users, withdrawalRequests, walletAccounts } from "@/lib/db"
import { fromMinorUnits, toMinorUnits } from "@/lib/wallet/money"
import { AppError } from "@/server/elysia/plugins/errors"
import { paginationMeta } from "@/server/lib/response"
import { platformSettingsService } from "@/server/services/platform-settings.service"
import { walletService } from "@/server/services/wallet.service"
import type { WithdrawalStatus } from "@/types/domain"

function serializeWithdrawal(row: typeof withdrawalRequests.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    walletId: row.walletId,
    amount: row.amount,
    currency: row.currency,
    amountFormatted: fromMinorUnits(row.amount, row.currency),
    status: row.status,
    payoutMethod: row.payoutMethod,
    payoutDetails: row.payoutDetails,
    adminNote: row.adminNote,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export const withdrawalService = {
  async createRequest(
    userId: string,
    input: {
      amount: string
      currency: string
      payoutMethod: string
      payoutDetails: {
        accountName?: string
        phone?: string
        operator?: string
        notes?: string
      }
    }
  ) {
    const currency = input.currency.toUpperCase()
    const amountMinor = toMinorUnits(input.amount, currency)
    const settings = await platformSettingsService.getSettings()

    if (amountMinor < settings.minWithdrawalAmount) {
      throw new AppError(
        "BAD_REQUEST",
        `Minimum withdrawal is ${fromMinorUnits(settings.minWithdrawalAmount, currency)} ${currency}`,
        400
      )
    }

    const account = await walletService.getOrCreateAccount(userId, currency)

    if (account.availableBalance < amountMinor) {
      throw new AppError("BAD_REQUEST", "Insufficient wallet balance", 400)
    }

    const [existingPending] = await db
      .select()
      .from(withdrawalRequests)
      .where(
        and(
          eq(withdrawalRequests.userId, userId),
          eq(withdrawalRequests.status, "pending")
        )
      )

    if (existingPending) {
      throw new AppError(
        "BAD_REQUEST",
        "You already have a pending withdrawal request",
        400
      )
    }

    return db.transaction(async (tx) => {
      await walletService.reserveForWithdrawal(account.id, amountMinor, tx)

      const [request] = await tx
        .insert(withdrawalRequests)
        .values({
          userId,
          walletId: account.id,
          amount: amountMinor,
          currency,
          payoutMethod: input.payoutMethod,
          payoutDetails: input.payoutDetails,
        })
        .returning()

      return serializeWithdrawal(request)
    })
  },

  async listForUser(userId: string, query: { page?: number; limit?: number } = {}) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit

    const rows = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))

    return {
      items: rows.map(serializeWithdrawal),
      meta: paginationMeta(page, limit, countResult?.count ?? 0),
    }
  },

  async listForAdmin(query: {
    page?: number
    limit?: number
    status?: WithdrawalStatus
    search?: string
  } = {}) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const offset = (page - 1) * limit

    const conditions = []
    if (query.status) {
      conditions.push(eq(withdrawalRequests.status, query.status))
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`
      conditions.push(
        or(
          ilike(users.email, term),
          ilike(users.name, term),
          ilike(withdrawalRequests.payoutMethod, term)
        )!
      )
    }

    const where = conditions.length ? and(...conditions) : undefined

    const rows = await db
      .select({
        withdrawal: withdrawalRequests,
        userEmail: users.email,
        userName: users.name,
      })
      .from(withdrawalRequests)
      .innerJoin(users, eq(withdrawalRequests.userId, users.id))
      .where(where)
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(limit)
      .offset(offset)

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(withdrawalRequests)
      .innerJoin(users, eq(withdrawalRequests.userId, users.id))
      .where(where)

    return {
      items: rows.map((row) => ({
        ...serializeWithdrawal(row.withdrawal),
        userEmail: row.userEmail,
        userName: row.userName,
      })),
      meta: paginationMeta(page, limit, countResult?.count ?? 0),
    }
  },

  async getById(id: string) {
    const [row] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id))
    return row ?? null
  },

  async approve(id: string, adminUserId: string) {
    const request = await this.getById(id)
    if (!request) throw new AppError("NOT_FOUND", "Withdrawal not found", 404)
    if (request.status !== "pending") {
      throw new AppError("BAD_REQUEST", "Withdrawal is not pending", 400)
    }

    const [updated] = await db
      .update(withdrawalRequests)
      .set({
        status: "approved",
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, id))
      .returning()

    return serializeWithdrawal(updated)
  },

  async reject(id: string, adminUserId: string, note?: string) {
    const request = await this.getById(id)
    if (!request) throw new AppError("NOT_FOUND", "Withdrawal not found", 404)
    if (request.status !== "pending" && request.status !== "approved") {
      throw new AppError("BAD_REQUEST", "Withdrawal cannot be rejected", 400)
    }

    return db.transaction(async (tx) => {
      await walletService.releaseWithdrawal(request.walletId, request.amount, tx)

      const [updated] = await tx
        .update(withdrawalRequests)
        .set({
          status: "rejected",
          adminNote: note ?? null,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, id))
        .returning()

      return serializeWithdrawal(updated)
    })
  },

  async markPaid(id: string, adminUserId: string, note?: string) {
    const request = await this.getById(id)
    if (!request) throw new AppError("NOT_FOUND", "Withdrawal not found", 404)
    if (request.status !== "approved" && request.status !== "processing") {
      throw new AppError("BAD_REQUEST", "Withdrawal must be approved first", 400)
    }

    return db.transaction(async (tx) => {
      await walletService.debitForWithdrawal(
        request.walletId,
        request.id,
        request.amount,
        request.currency,
        tx
      )

      const [updated] = await tx
        .update(withdrawalRequests)
        .set({
          status: "paid",
          adminNote: note ?? request.adminNote,
          reviewedBy: adminUserId,
          reviewedAt: request.reviewedAt ?? new Date(),
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, id))
        .returning()

      return serializeWithdrawal(updated)
    })
  },
}
