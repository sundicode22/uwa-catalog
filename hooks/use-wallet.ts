"use client"

import { useApiMutation, useApiQuery, usePaginatedQuery } from "@/hooks/use-api"

export function useWalletSummary() {
  return useApiQuery("GET /wallet", { queryKey: ["wallet"] })
}

export function useWalletLedger(page = 1, currency?: string) {
  return usePaginatedQuery("GET /wallet/ledger", {
    query: { page, limit: 20, currency },
    queryKey: ["wallet", "ledger", page, currency],
  })
}

export function useWithdrawals(page = 1) {
  return usePaginatedQuery("GET /wallet/withdrawals", {
    query: { page, limit: 10 },
    queryKey: ["wallet", "withdrawals", page],
  })
}

export function useCreateWithdrawal() {
  return useApiMutation("POST /wallet/withdrawals", "POST", {
    invalidateKeys: [["GET /wallet"], ["wallet", "withdrawals"]],
    successMessage: "Withdrawal request submitted",
  })
}
