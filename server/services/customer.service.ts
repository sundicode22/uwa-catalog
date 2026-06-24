import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db, storeCustomers } from "@/lib/db"
import { normalizeCustomerPhone } from "@/lib/customers/phone"
import { paginationMeta } from "@/server/lib/response"
import { tenancyService } from "@/server/services/tenancy.service"
import { notFound, badRequest } from "@/server/elysia/plugins/errors"
import type {
  CreateStoreCustomerInput,
  CustomerListQuery,
  UpsertStoreCustomerInput,
  UpdateStoreCustomerInput,
} from "@/types/domain"

function customerSearchWhere(storeId: string, search?: string) {
  const conditions = [eq(storeCustomers.storeId, storeId)]
  if (search?.trim()) {
    const term = `%${search.trim()}%`
    conditions.push(
      or(
        ilike(storeCustomers.name, term),
        ilike(storeCustomers.phone, term),
        ilike(storeCustomers.email, term),
        ilike(storeCustomers.city, term)
      )!
    )
  }
  return and(...conditions)
}

export const customerService = {
  async list(storeId: string, userId: string, query: CustomerListQuery = {}) {
    await tenancyService.assertStoreOwner(storeId, userId)

    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit
    const where = customerSearchWhere(storeId, query.search)

    const [totalResult] = await db
      .select({ count: count() })
      .from(storeCustomers)
      .where(where)

    const items = await db
      .select()
      .from(storeCustomers)
      .where(where)
      .orderBy(desc(storeCustomers.lastOrderAt), desc(storeCustomers.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      items,
      meta: paginationMeta(page, limit, totalResult.count),
    }
  },

  async getById(id: string, userId: string) {
    const [customer] = await db
      .select()
      .from(storeCustomers)
      .where(eq(storeCustomers.id, id))

    if (!customer) notFound("Customer not found")
    await tenancyService.assertStoreOwner(customer.storeId, userId)
    return customer
  },

  async create(userId: string, input: CreateStoreCustomerInput) {
    await tenancyService.assertStoreOwner(input.storeId, userId)
    const now = new Date()
    const phoneNormalized = normalizeCustomerPhone(input.phone)

    const [existing] = await db
      .select({ id: storeCustomers.id })
      .from(storeCustomers)
      .where(
        and(
          eq(storeCustomers.storeId, input.storeId),
          eq(storeCustomers.phoneNormalized, phoneNormalized)
        )
      )

    if (existing) {
      badRequest("A customer with this phone number already exists for this store")
    }

    const [customer] = await db
      .insert(storeCustomers)
      .values({
        storeId: input.storeId,
        name: input.name,
        phone: input.phone,
        phoneNormalized,
        email: input.email ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        region: input.region ?? null,
        notes: input.notes ?? null,
        updatedAt: now,
      })
      .returning()

    return customer
  },

  async update(id: string, userId: string, input: UpdateStoreCustomerInput) {
    const existing = await customerService.getById(id, userId)
    const now = new Date()

    const [customer] = await db
      .update(storeCustomers)
      .set({
        ...input,
        ...(input.phone
          ? {
              phone: input.phone,
              phoneNormalized: normalizeCustomerPhone(input.phone),
            }
          : {}),
        updatedAt: now,
      })
      .where(eq(storeCustomers.id, existing.id))
      .returning()

    return customer
  },

  async upsertFromOrder(storeId: string, input: UpsertStoreCustomerInput) {
    const now = new Date()
    const phoneNormalized = normalizeCustomerPhone(input.phone)

    const [existing] = await db
      .select()
      .from(storeCustomers)
      .where(
        and(
          eq(storeCustomers.storeId, storeId),
          eq(storeCustomers.phoneNormalized, phoneNormalized)
        )
      )

    if (existing) {
      const [customer] = await db
        .update(storeCustomers)
        .set({
          name: input.name,
          phone: input.phone,
          phoneNormalized,
          email: input.email ?? existing.email,
          address: input.address ?? existing.address,
          city: input.city ?? existing.city,
          region: input.region ?? existing.region,
          notes: input.notes ?? existing.notes,
          totalOrders: sql`${storeCustomers.totalOrders} + 1`,
          totalSpent: sql`(${storeCustomers.totalSpent}::numeric + ${input.orderTotal}::numeric)::text`,
          lastOrderAt: now,
          updatedAt: now,
        })
        .where(eq(storeCustomers.id, existing.id))
        .returning()

      return customer
    }

    const [customer] = await db
      .insert(storeCustomers)
      .values({
        storeId,
        name: input.name,
        phone: input.phone,
        phoneNormalized,
        email: input.email ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        region: input.region ?? null,
        notes: input.notes ?? null,
        totalOrders: 1,
        totalSpent: input.orderTotal,
        lastOrderAt: now,
        updatedAt: now,
      })
      .returning()

    return customer
  },
}
