import { success } from "@/server/lib/response"
import { subscriptionService } from "@/server/services/subscription.service"
import { stripeBillingService } from "@/server/services/billing/stripe.service"
import { notchpayBillingService } from "@/server/services/billing/notchpay.service"
import type { SubscriptionPlan } from "@/lib/billing/plans"

export const billingController = {
  async getSummary(userId: string) {
    const summary = await subscriptionService.getBillingSummary(userId)
    return success(summary)
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
