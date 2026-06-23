"use client"

import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import type { Product, ProductSelections } from "@/types/domain"
import {
  calculateUnitPrice,
  cartLineKey,
  buildDisplayName,
  emptySelections,
} from "@/lib/product-options"
import {
  canAddToCart,
  getMaxCartQuantity,
  isInStock,
} from "@/lib/inventory"

export interface CartItem {
  lineKey: string
  product: Product
  quantity: number
  selections: ProductSelections
  unitPrice: number
  displayName: string
}

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, selections?: ProductSelections) => boolean
  removeItem: (lineKey: string) => void
  updateQuantity: (lineKey: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const addItem = useCallback(
    (product: Product, selections: ProductSelections = emptySelections()) => {
      if (!isInStock(product)) {
        toast.error(`${product.name} is out of stock`)
        return false
      }

      let added = false

      setItems((prev) => {
        const lineKey = cartLineKey(product.id, selections)
        const existing = prev.find((i) => i.lineKey === lineKey)

        if (!canAddToCart(product, prev, 1)) {
          toast.error(`Only ${getMaxCartQuantity(product, prev, existing?.quantity ?? 0)} available for ${product.name}`)
          return prev
        }

        added = true
        const unitPrice = calculateUnitPrice(product.price, selections)
        const displayName = buildDisplayName(product.name, selections)

        if (existing) {
          return prev.map((i) =>
            i.lineKey === lineKey ? { ...i, quantity: i.quantity + 1 } : i
          )
        }

        return [
          ...prev,
          { lineKey, product, quantity: 1, selections, unitPrice, displayName },
        ]
      })

      return added
    },
    []
  )

  const removeItem = useCallback((lineKey: string) => {
    setItems((prev) => prev.filter((i) => i.lineKey !== lineKey))
  }, [])

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.lineKey !== lineKey))
      return
    }

    setItems((prev) => {
      const item = prev.find((i) => i.lineKey === lineKey)
      if (!item) return prev

      const maxQuantity = getMaxCartQuantity(item.product, prev, item.quantity)
      const nextQuantity = Math.min(quantity, maxQuantity)

      if (nextQuantity < quantity) {
        toast.error(`Only ${maxQuantity} available for ${item.product.name}`)
      }

      return prev.map((i) =>
        i.lineKey === lineKey ? { ...i, quantity: nextQuantity } : i
      )
    })
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
