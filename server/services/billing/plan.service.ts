import { unstable_cache } from "next/cache"
import { asc, eq } from "drizzle-orm"
import { db, billingPlanDefinitions } from "@/lib/db"
import {
  DEFAULT_BILLING_PLANS,
  type PlanDefinition,
  type SubscriptionPlan,
} from "@/lib/billing/plans"

function rowToPlan(row: typeof billingPlanDefinitions.$inferSelect): PlanDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    monthlyPriceUsd: row.monthlyPriceUsd,
    monthlyPriceXaf: row.monthlyPriceXaf,
    maxStores: row.maxStores,
    maxProductsPerStore: row.maxProductsPerStore,
    features: row.features,
    sortOrder: row.sortOrder,
    isPopular: row.isPopular,
    isActive: row.isActive,
  }
}

async function loadPlansFromDb() {
  const rows = await db
    .select()
    .from(billingPlanDefinitions)
    .where(eq(billingPlanDefinitions.isActive, true))
    .orderBy(asc(billingPlanDefinitions.sortOrder))

  return rows.map(rowToPlan)
}

const getCachedActivePlans = unstable_cache(
  loadPlansFromDb,
  ["billing-active-plans"],
  { revalidate: 3600 }
)

export const planService = {
  async getAllPlans(): Promise<PlanDefinition[]> {
    const plans = await getCachedActivePlans()
    if (plans.length > 0) return plans
    return Object.values(DEFAULT_BILLING_PLANS)
  },

  async getAllPlansForAdmin(): Promise<PlanDefinition[]> {
    const rows = await db
      .select()
      .from(billingPlanDefinitions)
      .orderBy(asc(billingPlanDefinitions.sortOrder))

    if (rows.length > 0) return rows.map(rowToPlan)
    return Object.values(DEFAULT_BILLING_PLANS)
  },

  async getPlan(id: SubscriptionPlan): Promise<PlanDefinition> {
    const plans = await planService.getAllPlans()
    const plan = plans.find((p) => p.id === id)
    if (!plan) return DEFAULT_BILLING_PLANS[id]
    return plan
  },

  async getPlanLimits(plan: SubscriptionPlan) {
    const definition = await planService.getPlan(plan)
    return {
      maxStores: definition.maxStores,
      maxProductsPerStore: definition.maxProductsPerStore,
    }
  },

  async updatePlan(
    id: SubscriptionPlan,
    input: Partial<
      Pick<
        PlanDefinition,
        | "name"
        | "description"
        | "monthlyPriceUsd"
        | "monthlyPriceXaf"
        | "maxStores"
        | "maxProductsPerStore"
        | "features"
        | "sortOrder"
        | "isPopular"
        | "isActive"
      >
    >
  ) {
    const [updated] = await db
      .update(billingPlanDefinitions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(billingPlanDefinitions.id, id))
      .returning()

    if (!updated) return null
    return rowToPlan(updated)
  },

  async seedDefaults() {
    const values = Object.values(DEFAULT_BILLING_PLANS).map((plan, index) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPriceUsd: plan.monthlyPriceUsd,
      monthlyPriceXaf: plan.monthlyPriceXaf,
      maxStores: plan.maxStores,
      maxProductsPerStore: plan.maxProductsPerStore,
      features: plan.features,
      sortOrder: plan.sortOrder ?? index,
      isPopular: plan.isPopular ?? plan.id === "basic",
      isActive: plan.isActive ?? true,
    }))

    for (const value of values) {
      await db
        .insert(billingPlanDefinitions)
        .values(value)
        .onConflictDoUpdate({
          target: billingPlanDefinitions.id,
          set: {
            name: value.name,
            description: value.description,
            monthlyPriceUsd: value.monthlyPriceUsd,
            monthlyPriceXaf: value.monthlyPriceXaf,
            maxStores: value.maxStores,
            maxProductsPerStore: value.maxProductsPerStore,
            features: value.features,
            sortOrder: value.sortOrder,
            isPopular: value.isPopular,
            isActive: value.isActive,
            updatedAt: new Date(),
          },
        })
    }

    return planService.getAllPlansForAdmin()
  },
}
