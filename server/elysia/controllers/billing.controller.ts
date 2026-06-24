import { success } from "@/server/lib/response"
import { subscriptionService } from "@/server/services/subscription.service"
import { stripeBillingService } from "@/server/services/billing/stripe.service"
import { notchpayBillingService } from "@/server/services/billing/notchpay.service"
import { planService } from "@/server/services/billing/plan.service"
import { isPlatformAdmin } from "@/lib/billing/platform-admin"
import { forbidden, notFound } from "@/server/elysia/plugins/errors"
import type { SubscriptionPlan } from "@/lib/billing/plans"
import type { PlanDefinition } from "@/lib/billing/plans"

function requirePlatformAdmin(email: string | null | undefined) {
  if (!isPlatformAdmin(email)) forbidden("Platform admin access required")
}

export const billingController = {
  async getPlans() {
    const plans = await planService.getAllPlans()
    return success({ plans })
  },

  async getSummary(userId: string, userEmail?: string | null) {
    const summary = await subscriptionService.getBillingSummary(userId)
    return success({
      ...summary,
      canManagePlans: isPlatformAdmin(userEmail),
    })
  },

  async getAdminPlans(userEmail: string | null | undefined) {
    requirePlatformAdmin(userEmail)
    const plans = await planService.getAllPlansForAdmin()
    return success({ plans })
  },

  async updatePlan(
    userEmail: string | null | undefined,
    planId: SubscriptionPlan,
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
    requirePlatformAdmin(userEmail)
    const updated = await planService.updatePlan(planId, input)
    if (!updated) notFound("Plan not found")
    return success({ plan: updated })
  },

  async createStripeCheckout(userId: string, plan: SubscriptionPlan) {
    const result = await stripeBillingService.createCheckoutSession(userId, plan)
    return success(result)
  },

  async createStripePortal(userId: string) {
    const result = await stripeBillingService.createBillingPortalSession(userId)
    return success(result)
  },

  async createNotchPayCheckout(userId: string, plan: SubscriptionPlan) {
    const result = await notchpayBillingService.createPayment(userId, plan)
    return success(result)
  },

  async verifyNotchPayPayment(userId: string, reference: string) {
    const result = await notchpayBillingService.verifyPayment(reference, userId)
    return success(result)
  },
}
