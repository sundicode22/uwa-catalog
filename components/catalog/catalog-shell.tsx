"use client"

import dynamic from "next/dynamic"
import { CartProvider } from "@/components/catalog/cart-context"
import type { StoreWithCategories } from "@/types/domain"

const CartDrawer = dynamic(
  () =>
    import("@/components/catalog/cart-drawer").then((module) => ({
      default: module.CartDrawer,
    })),
  { ssr: false }
)

export function CatalogShell({
  store,
  premium = false,
  children,
}: {
  store: StoreWithCategories
  premium?: boolean
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className={premium ? "min-h-screen" : "min-h-screen bg-background"}>
        {premium ? (
          children
        ) : (
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        )}
        <CartDrawer store={store} showFab={!premium} />
      </div>
    </CartProvider>
  )
}
