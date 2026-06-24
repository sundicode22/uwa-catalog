"use client"

import { useState } from "react"
import Image from "next/image"
import { BackLink } from "@/components/ui/back-link"
import { Button } from "@/components/ui/button"
import { ProductOptionsModal } from "@/components/catalog/product-options-modal"
import { StorefrontFooter } from "@/components/catalog/storefront-footer"
import { StorefrontHeader } from "@/components/catalog/storefront-header"
import { useCart } from "@/components/catalog/cart-context"
import { productHasOptions } from "@/lib/product-options"
import { resolveStoreCurrency } from "@/lib/currency"
import { formatMoney } from "@/lib/format"
import { formatInventoryLabel, formatStockRemaining, isInStock } from "@/lib/inventory"
import type { Category, Product, StoreWithCategories } from "@/types/domain"

interface ProductPageClientProps {
  store: StoreWithCategories
  product: Product
  category: Category | null
  premium?: boolean
}

export function ProductPageClient({
  store,
  product,
  category,
  premium = false,
}: ProductPageClientProps) {
  const { addItem, items } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const images = product.images ?? []
  const hasOptions = productHasOptions(product)
  const stockLabel =
    formatStockRemaining(product, items) ?? formatInventoryLabel(product.inventory)

  const currency = resolveStoreCurrency(store)

  function handleAddToCart() {
    if (hasOptions) {
      setOptionsOpen(true)
      return
    }
    addItem(product)
  }

  return (
    <div className={premium ? "bg-[#f5f2ed] text-foreground" : "bg-background"}>
      {premium ? <StorefrontHeader store={store} /> : null}

      <div className={premium ? "mx-auto max-w-7xl px-4 py-6" : "mb-6"}>
        <BackLink
          href={premium ? `/c/${store.slug}#shop` : `/c/${store.slug}`}
          className={
            premium
              ? "text-foreground/70 hover:text-foreground"
              : undefined
          }
        >
          {premium ? "Back to shop" : "Back to catalog"}
        </BackLink>
      </div>

      <main
        className={
          premium
            ? "mx-auto grid max-w-7xl gap-10 px-4 pb-16 lg:grid-cols-2 lg:gap-16"
            : "grid gap-8 md:grid-cols-2"
        }
      >
        <div className="space-y-4">
          {images.length > 0 ? (
            images.map((img, index) => (
              <div key={img.publicId} className="relative aspect-square bg-white">
                <Image
                  src={img.url}
                  alt={
                    images.length > 1
                      ? `${product.name} image ${index + 1} — ${store.name}`
                      : `${product.name} — ${store.name}`
                  }
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))
          ) : (
            <div className="aspect-square bg-neutral-200" />
          )}
        </div>

        <div className="flex flex-col justify-center space-y-6">
          {category ? (
            <p className="text-xs tracking-[0.25em] text-foreground/60 uppercase">
              {category.name}
            </p>
          ) : null}
          <h1
            className={
              premium
                ? "text-4xl leading-tight font-medium md:text-5xl"
                : "text-3xl font-bold"
            }
          >
            {product.name}
          </h1>
          <p className="text-2xl font-semibold tabular-nums whitespace-nowrap sm:text-3xl">
            {formatMoney(product.price, currency)}
          </p>
          {product.description ? (
            <p className="max-w-lg leading-relaxed text-foreground/70">
              {product.description}
            </p>
          ) : null}
          {hasOptions ? (
            <p className="text-sm text-foreground/60">
              Customizable — choose options before adding to cart
            </p>
          ) : null}
          {stockLabel ? (
            <p
              className={`text-sm ${
                !isInStock(product) ? "text-destructive" : "text-foreground/60"
              }`}
            >
              {stockLabel}
            </p>
          ) : null}
          <Button
            size="lg"
            className={
              premium
                ? "h-12 w-full max-w-sm rounded-none bg-foreground text-background hover:bg-foreground/90 sm:w-auto sm:px-10"
                : undefined
            }
            onClick={handleAddToCart}
            disabled={!isInStock(product)}
          >
            {isInStock(product) ? "Add to cart" : "Out of stock"}
          </Button>
        </div>
      </main>

      {premium ? <StorefrontFooter store={store} /> : null}

      <ProductOptionsModal
        product={product}
        storeCurrency={store.currency}
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        onConfirm={(p, selections) => addItem(p, selections)}
      />
    </div>
  )
}
