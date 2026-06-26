import { and, eq, sql } from "drizzle-orm"
import { db, storeDiscountCodes } from "@/lib/db"
import { calculateDiscountAmount } from "@/lib/checkout/totals"
import { badRequest, notFound } from "@/server/elysia/plugins/errors"
import { tenancyService } from "./tenancy.service"
import type {
  CreateDiscountCodeInput,
  DiscountCode,
  UpdateDiscountCodeInput,
} from "@/types/domain"

function serialize(row: typeof storeDiscountCodes.$inferSelect): DiscountCode {
  return {
    id: row.id,
    storeId: row.storeId,
    code: row.code,
    type: row.type,
    value: row.value,
    minOrderTotal: row.minOrderTotal,
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export const discountCodeService = {
  async list(storeId: string, userId: string) {
    await tenancyService.assertStoreOwner(storeId, userId)
    const rows = await db
      .select()
      .from(storeDiscountCodes)
      .where(eq(storeDiscountCodes.storeId, storeId))
      .orderBy(storeDiscountCodes.createdAt)
    return rows.map(serialize)
  },

  async create(userId: string, input: CreateDiscountCodeInput) {
    await tenancyService.assertStoreOwner(input.storeId, userId)
    const code = input.code.trim().toUpperCase()
    if (!code) badRequest("Discount code is required")

    const [row] = await db
      .insert(storeDiscountCodes)
      .values({
        storeId: input.storeId,
        code,
        type: input.type,
        value: input.value,
        minOrderTotal: input.minOrderTotal ?? null,
        maxUses: input.maxUses ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive ?? true,
      })
      .returning()
    return serialize(row)
  },

  async update(id: string, userId: string, input: UpdateDiscountCodeInput) {
    const [existing] = await db
      .select()
      .from(storeDiscountCodes)
      .where(eq(storeDiscountCodes.id, id))
    if (!existing) notFound("Discount code not found")
    await tenancyService.assertStoreOwner(existing.storeId, userId)

    const [row] = await db
      .update(storeDiscountCodes)
      .set({
        ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.value ? { value: input.value } : {}),
        ...(input.minOrderTotal !== undefined
          ? { minOrderTotal: input.minOrderTotal }
          : {}),
        ...(input.maxUses !== undefined ? { maxUses: input.maxUses } : {}),
        ...(input.expiresAt !== undefined
          ? {
              expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedAt: new Date(),
      })
      .where(eq(storeDiscountCodes.id, id))
      .returning()
    return serialize(row)
  },

  async delete(id: string, userId: string) {
    const [existing] = await db
      .select()
      .from(storeDiscountCodes)
      .where(eq(storeDiscountCodes.id, id))
    if (!existing) notFound("Discount code not found")
    await tenancyService.assertStoreOwner(existing.storeId, userId)
    await db.delete(storeDiscountCodes).where(eq(storeDiscountCodes.id, id))
    return { id }
  },

  async validate(storeId: string, code: string, subtotal: number) {
    const normalized = code.trim().toUpperCase()
    const [row] = await db
      .select()
      .from(storeDiscountCodes)
      .where(
        and(
          eq(storeDiscountCodes.storeId, storeId),
          eq(storeDiscountCodes.code, normalized)
        )
      )
    if (!row || !row.isActive) badRequest("Invalid discount code")
    if (row.expiresAt && row.expiresAt < new Date()) {
      badRequest("This discount code has expired")
    }
    if (row.maxUses !== null && row.usedCount >= row.maxUses) {
      badRequest("This discount code has reached its usage limit")
    }

    const discount = serialize(row)
    const amount = calculateDiscountAmount({ subtotal, code: discount })
    if (amount <= 0) badRequest("Discount code does not apply to this order")

    return { code: discount, discountAmount: amount.toFixed(2) }
  },

  async incrementUsage(id: string) {
    await db
      .update(storeDiscountCodes)
      .set({
        usedCount: sql`${storeDiscountCodes.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(storeDiscountCodes.id, id))
  },
}
