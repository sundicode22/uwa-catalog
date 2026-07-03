"use client"

import { useApiMutation, useApiQuery, usePaginatedQuery } from "@/hooks/use-api"
import type { WithdrawalStatus } from "@/types/domain"

export function useAdminOverview() {
  return useApiQuery("GET /admin/overview", { queryKey: ["admin", "overview"] })
}

export function useAdminWithdrawals(
  page = 1,
  status?: WithdrawalStatus,
  search?: string
) {
  return usePaginatedQuery("GET /admin/withdrawals", {
    query: { page, limit: 20, status, search: search || undefined },
    queryKey: ["admin", "withdrawals", page, status, search],
  })
}

export function useAdminUsers(page = 1, search?: string) {
  return usePaginatedQuery("GET /admin/users", {
    query: { page, limit: 20, search: search || undefined },
    queryKey: ["admin", "users", page, search],
  })
}

export function useAdminStores(page = 1, search?: string) {
  return usePaginatedQuery("GET /admin/stores", {
    query: { page, limit: 20, search: search || undefined },
    queryKey: ["admin", "stores", page, search],
  })
}

export function useAdminVisitors(days = 7, storeId?: string) {
  return useApiQuery("GET /admin/visitors", {
    query: { days, storeId },
    queryKey: ["admin", "visitors", days, storeId],
  })
}

export function useAdminSettings() {
  return useApiQuery("GET /admin/settings", { queryKey: ["admin", "settings"] })
}

export function useUpdateAdminSettings() {
  return useApiMutation("PATCH /admin/settings", "PATCH", {
    invalidateKeys: [["GET /admin/settings"], ["admin", "settings"]],
    successMessage: "Settings saved",
  })
}

export function useUpdateWithdrawal() {
  return useApiMutation("PATCH /admin/withdrawals/:id", "PATCH", {
    invalidateKeys: [
      ["GET /admin/withdrawals"],
      ["admin", "withdrawals"],
      ["GET /admin/overview"],
      ["admin", "overview"],
    ],
  })
}
