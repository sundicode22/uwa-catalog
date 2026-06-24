"use client"

import { useStore } from "./use-store"
import { usePaginatedQuery } from "./use-api"
import type { StoreTransactionStatus } from "@/types/domain"

export function useTransactions(
  page = 1,
  limit = 10,
  filters?: { search?: string; status?: string }
) {
  const { store } = useStore()
  return usePaginatedQuery("GET /stores/:storeId/transactions", {
    params: store ? { storeId: store.id } : undefined,
    query: {
      page,
      limit,
      search: filters?.search || undefined,
      status:
        filters?.status && filters.status !== "all"
          ? (filters.status as StoreTransactionStatus)
          : undefined,
    },
    enabled: !!store,
    queryKey: ["transactions", store?.id, page, limit, filters],
  })
}
