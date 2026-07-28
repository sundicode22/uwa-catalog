"use client"

import { useState } from "react"
import { LockIcon } from "lucide-react"
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
  storeCurrency?: string
  layout: CatalogLayout
}

export function ProductCard({
  product,
  storeSlug,
  storeCurrency,
  layout,
}: ProductCardProps) {
  const { addItem } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const hasOptions = productHasOptions(product)
  const isList = layout === "list"
  const locked = product.locked === true

  function handleAddToCart() {
    if (locked) return
    if (hasOptions) {
      setOptionsOpen(true)
      return
    }
    addItem(product)
  }

  return (
    <>
      <div
        className={cn(
          "group/card relative overflow-hidden rounded-2xl border border-border",
          locked && "pointer-events-none select-none"
        )}
      >
        <ProductImageFrame
          product={product}
          storeSlug={storeSlug}
          storeCurrency={storeCurrency}
          onOpenOptions={() => {
            if (!locked) setOptionsOpen(true)
          }}
          onAddToCart={handleAddToCart}
          locked={locked}
          className={cn("w-full", isList ? "aspect-video" : "aspect-square")}
        />
        {locked ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/40 backdrop-blur-md">
            <span className="flex size-10 items-center justify-center rounded-full bg-foreground/80 text-background">
              <LockIcon className="size-4" />
            </span>
            <span className="rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background">
              Unavailable
            </span>
          </div>
        ) : null}
      </div>

      {!locked ? (
        <ProductOptionsModal
          product={product}
          storeCurrency={storeCurrency}
          open={optionsOpen}
          onOpenChange={setOptionsOpen}
          onConfirm={(p, selections) => addItem(p, selections)}
        />
      ) : null}
    </>
  )
}
