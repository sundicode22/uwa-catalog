"use client"

import { useStore } from "./use-store"
import { useApiMutation, usePaginatedQuery } from "./use-api"
import { storeQueryKeys } from "@/lib/invalidate-keys"

export function useOrders(
  page = 1,
  limit = 10,
  filters?: { search?: string; status?: string }
) {
  const { store } = useStore()
  return usePaginatedQuery("GET /stores/:storeId/orders", {
    params: store ? { storeId: store.id } : undefined,
    query: {
      page,
      limit,
      search: filters?.search || undefined,
      status:
        filters?.status && filters.status !== "all"
          ? (filters.status as
              | "pending"
              | "confirmed"
              | "fulfilled"
              | "cancelled")
          : undefined,
    },
    enabled: !!store,
    queryKey: ["orders", store?.id, page, limit, filters],
  })
}

export function useCreateOrder(storeId?: string) {
  const keys = storeId ? storeQueryKeys(storeId) : null
  return useApiMutation("POST /orders", "POST", {
    successMessage: "Order saved successfully",
    invalidateKeys: keys ? [keys.orders, keys.stats] : [],
  })
}

export function useUpdateOrderStatus() {
  const { store } = useStore()
  const keys = store ? storeQueryKeys(store.id) : null
  return useApiMutation("PATCH /orders/:id/status", "PATCH", {
    successMessage: "Order status updated",
    invalidateKeys: keys ? [keys.orders, keys.stats] : [],
  })
}
