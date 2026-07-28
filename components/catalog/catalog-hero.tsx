"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { resolveStoreCurrency } from "@/lib/currency"
import { formatMoney } from "@/lib/format"
import { productHasOptions } from "@/lib/product-options"
import { cn } from "@/lib/utils"
import type { Product, StoreWithCategories } from "@/types/domain"
import { LockIcon, SlidersHorizontalIcon } from "lucide-react"

export function CatalogHero({
  store,
  featuredProducts,
}: {
  store: StoreWithCategories
  featuredProducts: Product[]
}) {
  const currency = resolveStoreCurrency(store)

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
            sizes="100vw"
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
              {featuredProducts.map((product) => {
                const locked = product.locked === true
                const content = (
                  <>
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-300 group-hover/featured:scale-105",
                            locked && "scale-105 blur-md"
                          )}
                          sizes="80px"
                        />
                      ) : (
                        <div className={cn("size-full bg-muted", locked && "blur-md")} />
                      )}
                      {locked ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                          <LockIcon className="size-4 text-foreground" />
                        </div>
                      ) : productHasOptions(product) ? (
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
                        {formatMoney(product.price, currency)}
                      </p>
                      {locked ? (
                        <p className="mt-1 text-xs text-muted-foreground">Unavailable</p>
                      ) : productHasOptions(product) ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <SlidersHorizontalIcon className="size-3" />
                          Options available
                        </p>
                      ) : null}
                    </div>
                  </>
                )

                return (
                <CarouselItem
                  key={product.id}
                  className="basis-full pl-3 sm:basis-1/2 lg:basis-1/3"
                >
                  {locked ? (
                    <div className="group/featured flex pointer-events-none select-none gap-3 rounded-2xl border border-border bg-background/90 p-3 backdrop-blur-sm opacity-80">
                      {content}
                    </div>
                  ) : (
                    <Link
                      href={`/c/${store.slug}/products/${product.slug}`}
                      className="group/featured flex gap-3 rounded-2xl border border-border bg-background/90 p-3 backdrop-blur-sm transition-colors hover:bg-background"
                    >
                      {content}
                    </Link>
                  )}
                </CarouselItem>
                )
              })}
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
