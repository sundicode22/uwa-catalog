"use client"

import * as React from "react"
import { useApiQuery, useApiMutation } from "@/hooks/use-api"
import { StoreSetupLoader } from "@/components/dashboard/store-setup-loader"
import type { Store } from "@/types/domain"

const STORAGE_KEY = "uwa-active-store-id"

interface StoreContextValue {
  store: Store | null
  stores: Store[]
  setActiveStore: (store: Store) => void
  isLoading: boolean
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { data: stores, isLoading } = useApiQuery("GET /stores")
  const [activeStoreId, setActiveStoreId] = React.useState<string | null>(null)

  const storeList = stores ?? []

  React.useEffect(() => {
    if (storeList.length === 0) return

    const saved = localStorage.getItem(STORAGE_KEY)
    const savedExists = saved && storeList.some((s) => s.id === saved)

    if (savedExists) {
      setActiveStoreId(saved)
    } else {
      setActiveStoreId(storeList[0].id)
      localStorage.setItem(STORAGE_KEY, storeList[0].id)
    }
  }, [stores])

  const store =
    storeList.find((s) => s.id === activeStoreId) ?? storeList[0] ?? null

  const setActiveStore = React.useCallback((next: Store) => {
    setActiveStoreId(next.id)
    localStorage.setItem(STORAGE_KEY, next.id)
  }, [])

  if (isLoading) {
    return <StoreSetupLoader />
  }

  return (
    <StoreContext.Provider
      value={{ store, stores: storeList, setActiveStore, isLoading }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreContext() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStoreContext must be used within StoreProvider")
  return ctx
}

export function useCreateStore() {
  return useApiMutation("POST /stores", "POST", {
    successMessage: "Store created",
    invalidateKeys: [["GET /stores"]],
  })
}
