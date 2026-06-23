"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { formatMoney } from "@/lib/format"
import { productHasOptions } from "@/lib/product-options"
import type { Product, StoreWithCategories } from "@/types/domain"
import { SlidersHorizontalIcon } from "lucide-react"

export function CatalogHero({
  store,
  featuredProducts,
}: {
  store: StoreWithCategories
  featuredProducts: Product[]
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {store.coverImageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={store.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-background/75" />
        </div>
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          {store.logoUrl ? (
            <div className="relative size-14 shrink-0">
              <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                className="object-contain"
              />
            </div>
          ) : null}
          <div>
            <h1 className="text-xl font-semibold">{store.name}</h1>
            {store.description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {store.description}
              </p>
            ) : null}
          </div>
        </div>

        {featuredProducts.length > 0 ? (
          <Carousel opts={{ align: "start", loop: featuredProducts.length > 1 }}>
            <CarouselContent className="-ml-3">
              {featuredProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-full pl-3 sm:basis-1/2 lg:basis-1/3"
                >
                  <Link
                    href={`/c/${store.slug}/products/${product.slug}`}
                    className="group/featured flex gap-3 rounded-2xl border border-border bg-background/90 p-3 backdrop-blur-sm transition-colors hover:bg-background"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover/featured:scale-105"
                        />
                      ) : (
                        <div className="size-full bg-muted" />
                      )}
                      {productHasOptions(product) ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/featured:opacity-100">
                          <span className="flex size-8 items-center justify-center rounded-full bg-background/95 shadow-sm">
                            <SlidersHorizontalIcon className="size-3.5" />
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="shrink-0 text-base font-semibold tabular-nums whitespace-nowrap sm:text-lg">
                        {formatMoney(product.price, product.currency)}
                      </p>
                      {productHasOptions(product) ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <SlidersHorizontalIcon className="size-3" />
                          Options available
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {featuredProducts.length > 1 ? (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            ) : null}
          </Carousel>
        ) : null}
      </div>
    </section>
  )
}
