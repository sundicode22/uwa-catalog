"use client"

import { useState } from "react"
import { ProductOptionsModal } from "./product-options-modal"
import { ProductImageFrame } from "./product-hover-overlay"
import { useCart } from "./cart-context"
import { productHasOptions } from "@/lib/product-options"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/domain"
import type { CatalogLayout } from "@/types/domain"

interface ProductCardProps {
  product: Product
  storeSlug: string
  layout: CatalogLayout
}

export function ProductCard({ product, storeSlug, layout }: ProductCardProps) {
  const { addItem } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const hasOptions = productHasOptions(product)
  const isList = layout === "list"

  function handleAddToCart() {
    if (hasOptions) {
      setOptionsOpen(true)
      return
    }
    addItem(product)
  }

  return (
    <>
      <div className="group/card overflow-hidden rounded-2xl border border-border">
        <ProductImageFrame
          product={product}
          storeSlug={storeSlug}
          onOpenOptions={() => setOptionsOpen(true)}
          onAddToCart={handleAddToCart}
          className={cn("w-full", isList ? "aspect-video" : "aspect-square")}
        />
      </div>

      <ProductOptionsModal
        product={product}
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        onConfirm={(p, selections) => addItem(p, selections)}
      />
    </>
  )
}
