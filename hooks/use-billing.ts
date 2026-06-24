"use client"

import { useApiMutation, useApiQuery } from "@/hooks/use-api"
import type { AccountSubscriptionPlan } from "@/types/domain"

export function useBillingSummary() {
  return useApiQuery("GET /billing", {
    queryKey: ["billing"],
  })
}

export function useStripeCheckout() {
  return useApiMutation("POST /billing/stripe/checkout", "POST")
}

export function useStripePortal() {
  return useApiMutation("POST /billing/stripe/portal", "POST")
}

export function useNotchPayCheckout() {
  return useApiMutation("POST /billing/notchpay/checkout", "POST")
}

export function useNotchPayVerify() {
  return useApiMutation("POST /billing/notchpay/verify", "POST", {
    invalidateKeys: [["GET /billing"]],
  })
}

export type PaidPlan = Exclude<AccountSubscriptionPlan, "free">
