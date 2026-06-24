"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductImageFrame } from "@/components/catalog/product-hover-overlay"
import { ProductOptionsModal } from "@/components/catalog/product-options-modal"
import { useCart } from "@/components/catalog/cart-context"
import { StorefrontFooter } from "@/components/catalog/storefront-footer"
import { StorefrontHeader } from "@/components/catalog/storefront-header"
import { CatalogPagination } from "@/components/catalog/catalog-pagination"
import { ProductGridSkeleton } from "@/components/catalog/product-card-skeleton"
import { useFeaturedProducts, usePublicProducts } from "@/hooks/use-products"
import { formatMoney } from "@/lib/format"
import { productHasOptions } from "@/lib/product-options"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product, StoreWithCategories } from "@/types/domain"

const PRODUCTS_PER_PAGE = 12

function ProductTile({
  product,
  storeSlug,
  storeCurrency,
  badge,
}: {
  product: Product
  storeSlug: string
  storeCurrency?: string
  badge?: string
}) {
  const { addItem } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const hasOptions = productHasOptions(product)

  function handleAddToCart() {
    if (hasOptions) {
      setOptionsOpen(true)
      return
    }
    addItem(product)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-white">
        <ProductImageFrame
          product={product}
          storeSlug={storeSlug}
          storeCurrency={storeCurrency}
          onOpenOptions={() => setOptionsOpen(true)}
          onAddToCart={handleAddToCart}
          className="aspect-4/5 w-full bg-neutral-100"
        />
        {badge ? (
          <span className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-white px-2 py-1 text-xs tracking-wide uppercase">
            {badge}
          </span>
        ) : null}
      </div>

      <ProductOptionsModal
        product={product}
        storeCurrency={storeCurrency}
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        onConfirm={(p, selections) => addItem(p, selections)}
      />
    </>
  )
}

export function PremiumCatalog({ store }: { store: StoreWithCategories }) {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get("category")
  const searchQuery = searchParams.get("q")?.trim() ?? ""
  const [page, setPage] = useState(1)

  const selectedCategory = store.categories.find((c) => c.slug === categorySlug)

  useEffect(() => {
    setPage(1)
  }, [categorySlug, searchQuery])

  const { data: featuredResult } = useFeaturedProducts(store.id)
  const { data: allProductsResult } = usePublicProducts(store.id, 1, 50)
  const { data: filteredResult, isLoading } = usePublicProducts(
    store.id,
    page,
    PRODUCTS_PER_PAGE,
    {
      categoryId: selectedCategory?.id,
      search: searchQuery || undefined,
    }
  )

  const featuredProducts =
    (featuredResult?.data as Product[] | undefined) ?? []
  const allProducts = (allProductsResult?.data as Product[] | undefined) ?? []
  const products = (filteredResult?.data as Product[] | undefined) ?? []
  const meta = filteredResult?.meta

  const heroImages = useMemo(() => {
    const pool = featuredProducts.length > 0 ? featuredProducts : allProducts
    return pool.slice(0, 3)
  }, [featuredProducts, allProducts])

  const newArrivals = useMemo(() => {
    if (featuredProducts.length > 0) return featuredProducts
    return allProducts.slice(0, 8)
  }, [featuredProducts, allProducts])

  const categoryTiles = useMemo(() => {
    return store.categories.map((category) => {
      const image =
        allProducts.find((p) => p.categoryId === category.id)?.images?.[0]?.url ??
        allProducts[0]?.images?.[0]?.url
      return { category, image }
    })
  }, [store.categories, allProducts])

  const spotlightCategory = store.categories[0]

  return (
    <div className="bg-[#f5f2ed] text-foreground">
      <StorefrontHeader store={store} />

      {heroImages.length > 0 ? (
        <section className="grid md:grid-cols-3">
          {heroImages.map((product, index) => (
            <Link
              key={product.id}
              href={`/c/${store.slug}/products/${product.slug}`}
              className="relative aspect-[4/5] md:aspect-auto md:min-h-[420px]"
            >
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="size-full bg-neutral-200" />
              )}
            </Link>
          ))}
        </section>
      ) : store.coverImageUrl ? (
        <section className="relative min-h-[420px]">
          <Image
            src={store.coverImageUrl}
            alt={store.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:items-end">
        <h2 className="text-4xl leading-tight font-medium md:text-5xl">
          Style meets functional living
        </h2>
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-foreground/70">
            {store.description ??
              `At ${store.name}, we provide a diverse selection of products to enhance your experience. Explore our carefully curated items that blend style and functionality effortlessly.`}
          </p>
          <Link
            href={`/c/${store.slug}#shop`}
            className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm tracking-wide uppercase transition-colors hover:bg-foreground hover:text-background"
          >
            Shop now
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      {newArrivals.length > 0 && !searchQuery ? (
        <section className="relative px-4 py-10">
          <div className="pointer-events-none absolute top-8 left-1/2 flex size-36 -translate-x-1/2 items-center justify-center rounded-full border border-foreground/10 bg-white/70">
            <span className="text-sm tracking-[0.25em] uppercase">New arrivals</span>
          </div>
          <div className="mx-auto max-w-7xl pt-20">
            <Carousel opts={{ align: "start" }}>
              <CarouselContent className="-ml-4">
                {newArrivals.map((product, index) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-full pl-4 sm:basis-1/2 lg:basis-1/4"
                  >
                    <ProductTile
                      product={product}
                      storeSlug={store.slug}
                      storeCurrency={store.currency}
                      badge={index === 1 ? "New" : undefined}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {newArrivals.length > 4 ? (
                <>
                  <CarouselPrevious className="border-foreground/20 bg-white" />
                  <CarouselNext className="border-foreground/20 bg-white" />
                </>
              ) : null}
            </Carousel>
          </div>
        </section>
      ) : null}

      {categoryTiles.length > 0 && !searchQuery ? (
        <section className="px-4 py-16">
          <div className="relative mx-auto mb-10 max-w-7xl text-center">
            <div className="pointer-events-none absolute top-1/2 left-1/2 flex size-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/10 bg-white/70">
              <span className="text-sm tracking-[0.25em] uppercase">
                Our collections
              </span>
            </div>
            <h2 className="relative pt-24 text-sm tracking-[0.3em] uppercase">
              Browse by category
            </h2>
          </div>
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
            {categoryTiles.map(({ category, image }) => (
              <Link
                key={category.id}
                href={`/c/${store.slug}?category=${category.slug}#shop`}
                className="group relative min-h-[360px] overflow-hidden bg-white"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="size-full bg-neutral-200" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6">
                  <p className="text-lg tracking-[0.2em] text-white uppercase">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="vision" className="px-4 py-20 text-center">
        <p className="text-xs tracking-[0.3em] uppercase">Our vision</p>
        <p className="mx-auto mt-6 max-w-3xl text-2xl leading-relaxed font-medium md:text-3xl">
          We strive to offer a unique shopping experience with modern and elegant
          design choices. Our mission is to inspire and elevate your lifestyle
          with carefully selected products.
        </p>
      </section>

      {spotlightCategory && !searchQuery ? (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            {(() => {
              const spotlightProduct = allProducts.find(
                (p) => p.categoryId === spotlightCategory.id
              )
              const image =
                spotlightProduct?.images?.[0]?.url ?? allProducts[0]?.images?.[0]?.url
              if (!image) return null
              return (
                <Link
                  href={`/c/${store.slug}?category=${spotlightCategory.slug}#shop`}
                  className="group relative block min-h-[420px] overflow-hidden bg-white"
                >
                  <Image
                    src={image}
                    alt={spotlightCategory.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 text-sm tracking-[0.2em] uppercase">
                    {spotlightCategory.name}
                    <ArrowRightIcon className="size-4" />
                  </div>
                </Link>
              )
            })()}
          </div>
        </section>
      ) : null}

      <section id="shop" className="scroll-mt-28 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-medium">
                {searchQuery
                  ? `Results for “${searchQuery}”`
                  : selectedCategory
                    ? selectedCategory.name
                    : "All products"}
              </h2>
              <p className="text-sm text-foreground/60">
                {isLoading ? (
                  <Skeleton className="mt-1 h-4 w-24" />
                ) : (
                  `${meta?.total ?? products.length} product${(meta?.total ?? products.length) === 1 ? "" : "s"}`
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {(categorySlug || searchQuery) && (
                <Link
                  href={`/c/${store.slug}#shop`}
                  className="text-sm underline underline-offset-4"
                >
                  Clear filters
                </Link>
              )}
              <CatalogPagination
                meta={meta}
                onPageChange={setPage}
                disabled={isLoading}
              />
            </div>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={PRODUCTS_PER_PAGE} />
          ) : products.length === 0 ? (
            <p className="py-12 text-center text-foreground/60">
              {searchQuery
                ? "No products match your search."
                : "No products in this category yet."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  storeSlug={store.slug}
                  storeCurrency={store.currency}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <StorefrontFooter store={store} />
    </div>
  )
}
