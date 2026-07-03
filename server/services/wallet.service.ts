import { and, desc, eq } from "drizzle-orm"
import {
  db,
  walletAccounts,
  walletLedgerEntries,
  withdrawalRequests,
} from "@/lib/db"
import { calculatePlatformFee, fromMinorUnits, toMinorUnits } from "@/lib/wallet/money"
import { AppError } from "@/server/elysia/plugins/errors"
import { paginationMeta } from "@/server/lib/response"
import { platformSettingsService } from "@/server/services/platform-settings.service"
import type { WalletLedgerType } from "@/types/domain"

function serializeLedgerEntry(entry: typeof walletLedgerEntries.$inferSelect) {
  return {
    id: entry.id,
    walletId: entry.walletId,
    type: entry.type,
    amount: entry.amount,
    currency: entry.currency,
    amountFormatted: fromMinorUnits(entry.amount, entry.currency),
    balanceAfter: entry.balanceAfter,
    balanceAfterFormatted: fromMinorUnits(entry.balanceAfter, entry.currency),
    referenceType: entry.referenceType,
    referenceId: entry.referenceId,
    metadata: entry.metadata ?? null,
    createdAt: entry.createdAt.toISOString(),
  }
}

function serializeWallet(account: typeof walletAccounts.$inferSelect) {
  return {
    id: account.id,
    userId: account.userId,
    currency: account.currency,
    availableBalance: account.availableBalance,
    pendingBalance: account.pendingBalance,
    availableBalanceFormatted: fromMinorUnits(
      account.availableBalance,
      account.currency
    ),
    pendingBalanceFormatted: fromMinorUnits(
      account.pendingBalance,
      account.currency
    ),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  }
}

export const walletService = {
  async getOrCreateAccount(userId: string, currency: string) {
    const normalizedCurrency = currency.toUpperCase()
    const [existing] = await db
      .select()
      .from(walletAccounts)
      .where(
        and(
          eq(walletAccounts.userId, userId),
          eq(walletAccounts.currency, normalizedCurrency)
        )
      )

    if (existing) return existing

    const [created] = await db
      .insert(walletAccounts)
      .values({
        userId,
        currency: normalizedCurrency,
      })
      .returning()

    return created
  },

  async resolveCurrenciesForUser(userId: string) {
    const { stores } = await import("@/lib/db")
    const userStores = await db
      .select({ currency: stores.currency })
      .from(stores)
      .where(eq(stores.ownerId, userId))

    const currencies = [
      ...new Set(
        userStores
          .map((store) => store.currency?.trim().toUpperCase())
          .filter(Boolean)
      ),
    ] as string[]

    return currencies.length > 0 ? currencies : ["XAF"]
  },

  async ensureForUser(userId: string) {
    const currencies = await this.resolveCurrenciesForUser(userId)
    const accounts = await Promise.all(
      currencies.map((currency) => this.getOrCreateAccount(userId, currency))
    )
    return accounts
  },

  async ensureForAllUsers() {
    const { users } = await import("@/lib/db")
    const allUsers = await db.select({ id: users.id }).from(users)
    let created = 0

    for (const user of allUsers) {
      const before = await db
        .select({ id: walletAccounts.id })
        .from(walletAccounts)
        .where(eq(walletAccounts.userId, user.id))

      const accounts = await this.ensureForUser(user.id)
      if (accounts.length > before.length) {
        created += accounts.length - before.length
      }
    }

    return { users: allUsers.length, walletsCreated: created }
  },

  async getSummary(userId: string) {
    await this.ensureForUser(userId)

    const accounts = await db
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.userId, userId))

    const pendingRows = await db
      .select({ id: withdrawalRequests.id })
      .from(withdrawalRequests)
      .where(
        and(
          eq(withdrawalRequests.userId, userId),
          eq(withdrawalRequests.status, "pending")
        )
      )

    const recentLedger = await db
      .select({ entry: walletLedgerEntries })
      .from(walletLedgerEntries)
      .innerJoin(
        walletAccounts,
        eq(walletLedgerEntries.walletId, walletAccounts.id)
      )
      .where(eq(walletAccounts.userId, userId))
      .orderBy(desc(walletLedgerEntries.createdAt))
      .limit(10)

    const feePercent = await platformSettingsService.getPlatformFeePercent()

    return {
      accounts: accounts.map(serializeWallet),
      pendingWithdrawalsCount: pendingRows.length,
      platformFeePercent: feePercent,
      recentLedger: recentLedger.map((row) => serializeLedgerEntry(row.entry)),
    }
  },

  async listLedger(
    userId: string,
    query: { page?: number; limit?: number; currency?: string } = {}
  ) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const offset = (page - 1) * limit

    const conditions = [eq(walletAccounts.userId, userId)]
    if (query.currency) {
      conditions.push(eq(walletAccounts.currency, query.currency.toUpperCase()))
    }

    const rows = await db
      .select({ entry: walletLedgerEntries })
      .from(walletLedgerEntries)
      .innerJoin(
        walletAccounts,
        eq(walletLedgerEntries.walletId, walletAccounts.id)
      )
      .where(and(...conditions))
      .orderBy(desc(walletLedgerEntries.createdAt))
      .limit(limit)
      .offset(offset)

    const allRows = await db
      .select({ id: walletLedgerEntries.id })
      .from(walletLedgerEntries)
      .innerJoin(
        walletAccounts,
        eq(walletLedgerEntries.walletId, walletAccounts.id)
      )
      .where(and(...conditions))

    return {
      items: rows.map((row) => serializeLedgerEntry(row.entry)),
      meta: paginationMeta(page, limit, allRows.length),
    }
  },

  async hasOrderCredit(orderId: string) {
    const [entry] = await db
      .select()
      .from(walletLedgerEntries)
      .where(
        and(
          eq(walletLedgerEntries.referenceType, "order"),
          eq(walletLedgerEntries.referenceId, orderId),
          eq(walletLedgerEntries.type, "order_credit")
        )
      )
    return !!entry
  },

  async creditFromOrder(input: {
    userId: string
    orderId: string
    storeId: string
    grossAmount: string
    currency: string
  }) {
    const alreadyCredited = await this.hasOrderCredit(input.orderId)
    if (alreadyCredited) {
      return { alreadySettled: true as const }
    }

    const currency = input.currency.toUpperCase()
    const grossMinor = toMinorUnits(input.grossAmount, currency)
    if (grossMinor <= 0) {
      throw new AppError("BAD_REQUEST", "Invalid order amount for wallet credit", 400)
    }

    const feePercent = await platformSettingsService.getPlatformFeePercent()
    const feeMinor = calculatePlatformFee(grossMinor, feePercent)
    const netMinor = grossMinor - feeMinor

    return db.transaction(async (tx) => {
      const [existingCredit] = await tx
        .select()
        .from(walletLedgerEntries)
        .where(
          and(
            eq(walletLedgerEntries.referenceType, "order"),
            eq(walletLedgerEntries.referenceId, input.orderId),
            eq(walletLedgerEntries.type, "order_credit")
          )
        )

      if (existingCredit) {
        return { alreadySettled: true as const }
      }

      let [account] = await tx
        .select()
        .from(walletAccounts)
        .where(
          and(
            eq(walletAccounts.userId, input.userId),
            eq(walletAccounts.currency, currency)
          )
        )

      if (!account) {
        ;[account] = await tx
          .insert(walletAccounts)
          .values({ userId: input.userId, currency })
          .returning()
      }

      let balance = account.availableBalance

      if (feeMinor > 0) {
        await tx.insert(walletLedgerEntries).values({
          walletId: account.id,
          type: "platform_fee",
          amount: -feeMinor,
          currency,
          balanceAfter: balance,
          referenceType: "order",
          referenceId: input.orderId,
          metadata: {
            storeId: input.storeId,
            feePercent,
            grossMinor,
          },
        })
      }

      balance += netMinor
      await tx.insert(walletLedgerEntries).values({
        walletId: account.id,
        type: "order_credit",
        amount: netMinor,
        currency,
        balanceAfter: balance,
        referenceType: "order",
        referenceId: input.orderId,
        metadata: {
          storeId: input.storeId,
          grossMinor,
          feeMinor,
        },
      })

      await tx
        .update(walletAccounts)
        .set({
          availableBalance: balance,
          updatedAt: new Date(),
        })
        .where(eq(walletAccounts.id, account.id))

      return {
        alreadySettled: false as const,
        netMinor,
        feeMinor,
        grossMinor,
        currency,
      }
    })
  },

  async reserveForWithdrawal(
    walletId: string,
    amount: number,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  ) {
    const [account] = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, walletId))

    if (!account || account.availableBalance < amount) {
      throw new AppError("BAD_REQUEST", "Insufficient wallet balance", 400)
    }

    await tx
      .update(walletAccounts)
      .set({
        availableBalance: account.availableBalance - amount,
        pendingBalance: account.pendingBalance + amount,
        updatedAt: new Date(),
      })
      .where(eq(walletAccounts.id, walletId))
  },

  async releaseWithdrawal(
    walletId: string,
    amount: number,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  ) {
    const [account] = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, walletId))

    if (!account) return

    await tx
      .update(walletAccounts)
      .set({
        availableBalance: account.availableBalance + amount,
        pendingBalance: Math.max(0, account.pendingBalance - amount),
        updatedAt: new Date(),
      })
      .where(eq(walletAccounts.id, walletId))
  },

  async debitForWithdrawal(
    walletId: string,
    withdrawalId: string,
    amount: number,
    currency: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  ) {
    const [account] = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, walletId))

    if (!account) {
      throw new AppError("NOT_FOUND", "Wallet not found", 404)
    }

    const balanceAfter = account.availableBalance
    const pendingAfter = Math.max(0, account.pendingBalance - amount)

    await tx.insert(walletLedgerEntries).values({
      walletId,
      type: "withdrawal_debit" satisfies WalletLedgerType,
      amount: -amount,
      currency,
      balanceAfter,
      referenceType: "withdrawal",
      referenceId: withdrawalId,
    })

    await tx
      .update(walletAccounts)
      .set({
        pendingBalance: pendingAfter,
        updatedAt: new Date(),
      })
      .where(eq(walletAccounts.id, walletId))
  },
}
