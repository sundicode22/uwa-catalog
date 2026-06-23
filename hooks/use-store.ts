"use client"

import { useStoreContext } from "@/components/providers/store-provider"
import { useApiQuery } from "@/hooks/use-api"

export function useStore() {
  const { store, stores, setActiveStore, isLoading } = useStoreContext()

  return {
    store,
    stores,
    setActiveStore,
    isLoading,
  }
}

export function useStoreStats(storeId?: string) {
  return useApiQuery("GET /stores/:storeId/stats", {
    params: storeId ? { storeId } : undefined,
    enabled: !!storeId,
    queryKey: ["store-stats", storeId],
  })
}

export function useStoreBySlug(slug: string) {
  return useApiQuery("GET /stores/slug/:slug", {
    params: { slug },
    enabled: !!slug,
    queryKey: ["store-by-slug", slug],
  })
}
