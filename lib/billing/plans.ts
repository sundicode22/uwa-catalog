export type SubscriptionPlan = "free" | "basic" | "premium"

export interface PlanDefinition {
  id: SubscriptionPlan
  name: string
  description: string
  monthlyPriceUsd: number
  monthlyPriceXaf: number
  maxStores: number
  maxProductsPerStore: number
  features: string[]
}

function readEnvInt(key: string, fallback: number) {
  const raw = process.env[key]
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const BILLING_PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "Get started with one catalog",
    monthlyPriceUsd: 0,
    monthlyPriceXaf: 0,
    maxStores: 1,
    maxProductsPerStore: 10,
    features: ["1 store", "10 products per store", "Basic storefront"],
  },
  basic: {
    id: "basic",
    name: "Basic",
    description: "For growing sellers",
    monthlyPriceUsd: 9,
    monthlyPriceXaf: readEnvInt("NOTCHPAY_BASIC_AMOUNT_XAF", 5500),
    maxStores: 3,
    maxProductsPerStore: 100,
    features: ["3 stores", "100 products per store", "WhatsApp checkout"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    description: "For established brands",
    monthlyPriceUsd: 29,
    monthlyPriceXaf: readEnvInt("NOTCHPAY_PREMIUM_AMOUNT_XAF", 18000),
    maxStores: 10,
    maxProductsPerStore: 1000,
    features: [
      "10 stores",
      "1000 products per store",
      "Premium storefront layouts",
    ],
  },
}

export const PAID_PLANS = ["basic", "premium"] as const satisfies readonly SubscriptionPlan[]

export function getPlanLimits(plan: SubscriptionPlan) {
  const definition = BILLING_PLANS[plan]
  return {
    maxStores: definition.maxStores,
    maxProductsPerStore: definition.maxProductsPerStore,
  }
}

export function isPaidPlan(plan: SubscriptionPlan) {
  return plan === "basic" || plan === "premium"
}
