"use client"

import { useStore } from "./use-store"
import { useApiMutation, usePaginatedQuery, useApiQuery } from "./use-api"
import { storeQueryKeys } from "@/lib/invalidate-keys"

function customerInvalidation(storeId?: string) {
  if (!storeId) return []
  const keys = storeQueryKeys(storeId)
  return [keys.customers, keys.stats]
}

export function useCustomers(
  page = 1,
  limit = 10,
  filters?: { search?: string }
) {
  const { store } = useStore()
  return usePaginatedQuery("GET /stores/:storeId/customers", {
    params: store ? { storeId: store.id } : undefined,
    query: { page, limit, search: filters?.search || undefined },
    enabled: !!store,
    queryKey: ["customers", store?.id, page, limit, filters],
  })
}

export function useCustomer(customerId?: string) {
  return useApiQuery("GET /customers/:customerId", {
    params: customerId ? { customerId } : undefined,
    enabled: !!customerId,
    queryKey: ["customer", customerId],
  })
}

export function useCreateCustomer() {
  const { store } = useStore()
  return useApiMutation("POST /customers", "POST", {
    successMessage: "Customer saved",
    invalidateKeys: customerInvalidation(store?.id),
  })
}

export function useUpdateCustomer() {
  const { store } = useStore()
  return useApiMutation("PATCH /customers/:customerId", "PATCH", {
    successMessage: "Customer updated",
    invalidateKeys: customerInvalidation(store?.id),
  })
}
