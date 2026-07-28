import { and, asc, eq } from "drizzle-orm"
import { db, products, stores } from "@/lib/db"
import { planService } from "@/server/services/billing/plan.service"
import { subscriptionService } from "@/server/services/subscription.service"

export type CatalogPlanAccess = {
  plan: Awaited<ReturnType<typeof subscriptionService.getEffectivePlan>>
  maxStores: number
  maxProductsPerStore: number
  storeAllowed: boolean
  canUsePremiumStorefront: boolean
  unlockedProductIds: Set<string>
}

/**
 * Resolve storefront access for a store based on the owner's effective plan.
 * Oldest stores (by createdAt) stay active up to maxStores.
 * Oldest active products stay unlocked up to maxProductsPerStore.
 */
export async function getCatalogPlanAccess(
  storeId: string,
  ownerId: string
): Promise<CatalogPlanAccess> {
  const plan = await subscriptionService.getEffectivePlan(ownerId)
  const limits = await planService.getPlanLimits(plan)

  const ownerStores = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.ownerId, ownerId))
    .orderBy(asc(stores.createdAt))

  const allowedStoreIds = new Set(
    ownerStores.slice(0, limits.maxStores).map((s) => s.id)
  )
  const storeAllowed = allowedStoreIds.has(storeId)

  const unlockedRows = storeAllowed
    ? await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))
        .orderBy(asc(products.createdAt))
        .limit(limits.maxProductsPerStore)
    : []

  return {
    plan,
    maxStores: limits.maxStores,
    maxProductsPerStore: limits.maxProductsPerStore,
    storeAllowed,
    canUsePremiumStorefront: plan === "premium",
    unlockedProductIds: new Set(unlockedRows.map((r) => r.id)),
  }
}

export function isProductLocked(
  productId: string,
  access: CatalogPlanAccess
): boolean {
  if (!access.storeAllowed) return true
  return !access.unlockedProductIds.has(productId)
}
