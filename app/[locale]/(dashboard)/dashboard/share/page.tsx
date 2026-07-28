"use client"

import { ShareStoreCard } from "@/components/dashboard/share-store-card"
import { useStore } from "@/hooks/use-store"

export default function SharePage() {
  const { store } = useStore()

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Share store</h1>
      </div>
      <ShareStoreCard store={store} />
    </div>
  )
}
