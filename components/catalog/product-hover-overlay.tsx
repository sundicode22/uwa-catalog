"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import {
  ArrowUpRightIcon,
  ShoppingCartIcon,
  SlidersHorizontalIcon,
  TagIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { productHasOptions } from "@/lib/product-options"
import { formatMoney } from "@/lib/format"
import { formatInventoryLabel, isInStock } from "@/lib/inventory"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/domain"

export const productActionButtonClass =
  "size-10 rounded-full bg-background/95 text-foreground shadow-sm hover:bg-background"

export const productHoverOverlayClass =
  "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/85 via-black/55 to-black/25 p-4 opacity-0 transition-opacity duration-300 [@media(hover:hover)]:group-hover/card:opacity-100 [@media(hover:none)]:opacity-100"

interface ProductHoverOverlayProps {
  product: Product
  storeSlug: string
  storeCurrency?: string
  onOpenOptions: () => void
  onAddToCart: () => void
  showDetails?: boolean
}

export function ProductHoverOverlay({
  product,
  storeSlug,
  storeCurrency,
  onOpenOptions,
  onAddToCart,
  showDetails = true,
}: ProductHoverOverlayProps) {
  const hasOptions = productHasOptions(product)
  const inStock = isInStock(product)
  const inventoryLabel = formatInventoryLabel(product.inventory)
  const productHref = `/c/${storeSlug}/products/${product.slug}`
  const currency = storeCurrency ?? product.currency

  return (
    <div className={productHoverOverlayClass}>
      <div className="flex justify-end gap-2">
        {!inStock ? (
          <span className="rounded-full bg-destructive/90 px-2.5 py-1 text-xs text-white">
            Out of stock
          </span>
        ) : inventoryLabel ? (
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            {inventoryLabel}
          </span>
        ) : hasOptions ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            <SlidersHorizontalIcon className="size-3" />
            Customizable
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={productActionButtonClass}
          asChild
        >
          <Link href={productHref} aria-label={`View ${product.name}`}>
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </Button>

        {hasOptions ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className={productActionButtonClass}
            onClick={onOpenOptions}
            aria-label={`Customize ${product.name}`}
          >
            <SlidersHorizontalIcon className="size-4" />
          </Button>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={productActionButtonClass}
          onClick={onAddToCart}
          disabled={!inStock}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCartIcon className="size-4" />
        </Button>
      </div>

      {showDetails ? (
        <div className="space-y-1 text-white">
          <Link
            href={productHref}
            className="block font-medium leading-snug hover:underline"
          >
            {product.name}
          </Link>
          {product.description ? (
            <p className="line-clamp-2 text-sm text-white/80">{product.description}</p>
          ) : null}
          <p className="text-base font-semibold tabular-nums whitespace-nowrap sm:text-lg">
            <TagIcon className="mr-1 inline size-3.5 text-white/80" />
            {formatMoney(product.price, currency)}
          </p>
        </div>
      ) : null}
    </div>
  )
}

interface ProductImageFrameProps {
  product: Product
  storeSlug: string
  storeCurrency?: string
  onOpenOptions: () => void
  onAddToCart: () => void
  className?: string
  imageClassName?: string
  showDetails?: boolean
}

export function ProductImageFrame({
  product,
  storeSlug,
  storeCurrency,
  onOpenOptions,
  onAddToCart,
  className,
  imageClassName,
  showDetails = true,
}: ProductImageFrameProps) {
  const image = product.images?.[0]?.url

  return (
    <div className={cn("group/card relative overflow-hidden", className)}>
      {image ? (
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className={cn(
            "object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover/card:scale-105",
            imageClassName
          )}
        />
      ) : (
        <div className="size-full bg-muted" />
      )}

      <ProductHoverOverlay
        product={product}
        storeSlug={storeSlug}
        storeCurrency={storeCurrency}
        onOpenOptions={onOpenOptions}
        onAddToCart={onAddToCart}
        showDetails={showDetails}
      />
    </div>
  )
}
