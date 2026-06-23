"use client"

import { useStore } from "./use-store"
import { useApiMutation, useApiQuery } from "./use-api"
import { storeQueryKeys } from "@/lib/invalidate-keys"

function categoryInvalidation(storeId?: string) {
  if (!storeId) return []
  const keys = storeQueryKeys(storeId)
  return [keys.categories, keys.stats]
}

export function useCategories() {
  const { store } = useStore()
  return useApiQuery("GET /stores/:storeId/categories", {
    params: store ? { storeId: store.id } : undefined,
    enabled: !!store,
    queryKey: ["categories", store?.id],
  })
}

export function useCreateCategory() {
  const { store } = useStore()
  return useApiMutation("POST /categories", "POST", {
    successMessage: "Category created",
    invalidateKeys: categoryInvalidation(store?.id),
  })
}

export function useUpdateCategory() {
  const { store } = useStore()
  return useApiMutation("PATCH /categories/:id", "PATCH", {
    successMessage: "Category updated",
    invalidateKeys: categoryInvalidation(store?.id),
  })
}

export function useDeleteCategory() {
  const { store } = useStore()
  return useApiMutation("DELETE /categories/:id", "DELETE", {
    successMessage: "Category deleted",
    invalidateKeys: categoryInvalidation(store?.id),
  })
}

export function usePublicCategories(storeId: string) {
  return useApiQuery("GET /stores/:storeId/categories", {
    params: { storeId },
    enabled: !!storeId,
    queryKey: ["public-categories", storeId],
  })
}
