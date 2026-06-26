"use client"

import { useStore } from "./use-store"
import { useApiMutation, usePaginatedQuery, useApiQuery } from "./use-api"
import { storeQueryKeys } from "@/lib/invalidate-keys"

function productInvalidation(storeId?: string) {
  if (!storeId) return []
  const keys = storeQueryKeys(storeId)
  return [keys.products, keys.stats]
}

export function useProducts(
  page = 1,
  limit = 10,
  filters?: { search?: string; categoryId?: string; isActive?: boolean; isFeatured?: boolean }
) {
  const { store } = useStore()

  return usePaginatedQuery("GET /stores/:storeId/products", {
    params: store ? { storeId: store.id } : undefined,
    query: { page, limit, ...filters },
    enabled: !!store,
    queryKey: ["products", store?.id, page, limit, filters],
  })
}

export function useCreateProduct() {
  const { store } = useStore()
  return useApiMutation("POST /products", "POST", {
    successMessage: "Product created",
    invalidateKeys: store
      ? [
          ...productInvalidation(store.id),
          ["product-options"],
        ]
      : [["product-options"]],
  })
}

export function useUpdateProduct() {
  const { store } = useStore()
  return useApiMutation("PATCH /products/:id", "PATCH", {
    successMessage: "Product updated",
    invalidateKeys: store
      ? [
          ...productInvalidation(store.id),
          ["product-options"],
        ]
      : [["product-options"]],
  })
}

export function useDeleteProduct() {
  const { store } = useStore()
  return useApiMutation("DELETE /products/:id", "DELETE", {
    successMessage: "Product deleted",
    invalidateKeys: store
      ? [
          ...productInvalidation(store.id),
          ["product-options"],
        ]
      : [["product-options"]],
  })
}

export function useDuplicateProduct() {
  const { store } = useStore()
  return useApiMutation("POST /products/:id/duplicate", "POST", {
    successMessage: "Product duplicated",
    invalidateKeys: store
      ? [
          ...productInvalidation(store.id),
          ["product-options"],
        ]
      : [["product-options"]],
  })
}

export function usePublicProducts(
  storeId: string,
  page = 1,
  limit = 20,
  filters?: { categoryId?: string; isFeatured?: boolean; search?: string }
) {
  return usePaginatedQuery("GET /stores/:storeId/products", {
    params: { storeId },
    query: { page, limit, isActive: true, ...filters },
    enabled: !!storeId,
    queryKey: ["public-products", storeId, page, limit, filters],
  })
}

export function useFeaturedProducts(storeId: string) {
  return usePublicProducts(storeId, 1, 12, { isFeatured: true })
}

export function useProductOptions(productId?: string, enabled = true) {
  return useApiQuery("GET /products/:id/options", {
    params: productId ? { id: productId } : undefined,
    enabled: !!productId && enabled,
    queryKey: ["product-options", productId],
  })
}
