"use client"

import { useStore } from "./use-store"
import { useApiMutation, useApiQuery } from "./use-api"
import { storeQueryKeys } from "@/lib/invalidate-keys"
import type {
  CreateDiscountCodeInput,
  DiscountCode,
  ValidateDiscountResult,
} from "@/types/domain"

export function useDiscountCodes(storeId?: string) {
  return useApiQuery("GET /stores/:storeId/discounts", {
    params: storeId ? { storeId } : undefined,
    enabled: !!storeId,
    queryKey: ["discounts", storeId],
  })
}

export function useCreateDiscountCode(storeId: string) {
  const keys = storeQueryKeys(storeId)
  return useApiMutation("POST /discounts", "POST", {
    successMessage: "Discount code created",
    invalidateKeys: [["discounts", storeId], keys.stats],
  })
}

export function useDeleteDiscountCode(storeId: string) {
  return useApiMutation("DELETE /discounts/:id", "DELETE", {
    successMessage: "Discount code removed",
    invalidateKeys: [["discounts", storeId]],
  })
}

export function useValidateDiscount() {
  return useApiMutation("POST /discounts/validate", "POST")
}

export type { DiscountCode, CreateDiscountCodeInput, ValidateDiscountResult }
