"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { LayoutSwitcher } from "@/components/catalog/layout-switcher"
import { CatalogPagination } from "@/components/catalog/catalog-pagination"
import { CatalogLayoutRenderer } from "@/components/catalog/layouts"
import { CatalogLayoutSkeleton } from "@/components/catalog/product-card-skeleton"
import { CatalogHero } from "@/components/catalog/catalog-hero"
import { CatalogSearch } from "@/components/catalog/catalog-search"
import { useFeaturedProducts, usePublicProducts } from "@/hooks/use-products"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product, CatalogLayout, StoreWithCategories } from "@/types/domain"

const PRODUCTS_PER_PAGE = 12

export function CatalogPageClient({ store }: { store: StoreWithCategories }) {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get("category")
  const searchQuery = searchParams.get("q")?.trim() ?? ""
  const [layout, setLayout] = useState<CatalogLayout>(store.catalogLayout)
  const [page, setPage] = useState(1)

  const selectedCategory = store.categories.find((c) => c.slug === categorySlug)

  useEffect(() => {
    setPage(1)
  }, [categorySlug, searchQuery])

  const { data: featuredResult } = useFeaturedProducts(store.id)
  const { data: result, isLoading } = usePublicProducts(store.id, page, PRODUCTS_PER_PAGE, {
    categoryId: selectedCategory?.id,
    search: searchQuery || undefined,
  })

  const featuredProducts = (featuredResult?.data as Product[] | undefined) ?? []
  const products = (result?.data as Product[] | undefined) ?? []
  const meta = result?.meta

  const handleLayoutChange = useCallback((l: CatalogLayout) => {
    setLayout(l)
  }, [])

  const storeWithBranding = useMemo(
    () => ({
      ...store,
      coverImageUrl: store.coverImageUrl ?? null,
      logoUrl: store.logoUrl ?? null,
    }),
    [store]
  )

  return (
    <div className="-mx-4 space-y-6">
      <CatalogHero store={storeWithBranding} featuredProducts={featuredProducts} />

      <div className="space-y-6 px-4">
        <CatalogSearch storeSlug={store.slug} className="max-w-md" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!categorySlug ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/c/${store.slug}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}>
                All
              </Link>
            </Button>
            {store.categories.map((cat) => (
              <Button
                key={cat.id}
                variant={categorySlug === cat.slug ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link
                  href={`/c/${store.slug}?category=${cat.slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                >
                  {cat.name}
                </Link>
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CatalogPagination
              meta={meta}
              onPageChange={setPage}
              disabled={isLoading}
            />
            <LayoutSwitcher
              defaultLayout={store.catalogLayout}
              storeSlug={store.slug}
              onChange={handleLayoutChange}
            />
          </div>
        </div>

        {searchQuery ? (
          isLoading ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {`${meta?.total ?? products.length} result${(meta?.total ?? products.length) === 1 ? "" : "s"} for “${searchQuery}”`}
            </p>
          )
        ) : null}

        {isLoading ? (
          <CatalogLayoutSkeleton layout={layout} />
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {searchQuery ? "No products match your search." : "No products found."}
          </p>
        ) : (
          <CatalogLayoutRenderer
            layout={layout}
            products={products}
            storeSlug={store.slug}
            storeCurrency={store.currency}
          />
        )}
      </div>
    </div>
  )
}
