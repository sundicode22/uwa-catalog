import type { Product } from "@/types/domain"
import type { CatalogLayout } from "@/types/domain"
import { ProductCard } from "../product-card"

interface LayoutProps {
  products: Product[]
  storeSlug: string
  storeCurrency?: string
}

export function Grid2Layout({ products, storeSlug, storeCurrency }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          storeSlug={storeSlug}
          storeCurrency={storeCurrency}
          layout="grid-2"
        />
      ))}
    </div>
  )
}

export function Grid3Layout({ products, storeSlug, storeCurrency }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          storeSlug={storeSlug}
          storeCurrency={storeCurrency}
          layout="grid-3"
        />
      ))}
    </div>
  )
}

export function Grid4Layout({ products, storeSlug, storeCurrency }: LayoutProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          storeSlug={storeSlug}
          storeCurrency={storeCurrency}
          layout="grid-4"
        />
      ))}
    </div>
  )
}

export function ListLayout({ products, storeSlug, storeCurrency }: LayoutProps) {
  return (
    <div className="flex flex-col gap-3">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          storeSlug={storeSlug}
          storeCurrency={storeCurrency}
          layout="list"
        />
      ))}
    </div>
  )
}

export function MasonryLayout({ products, storeSlug, storeCurrency }: LayoutProps) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {products.map((p, i) => (
        <div key={p.id} className="mb-4 break-inside-avoid">
          <ProductCard
            product={p}
            storeSlug={storeSlug}
            storeCurrency={storeCurrency}
            layout={i % 3 === 0 ? "list" : "grid-3"}
          />
        </div>
      ))}
    </div>
  )
}

export function CatalogLayoutRenderer({
  layout,
  products,
  storeSlug,
  storeCurrency,
}: LayoutProps & { layout: CatalogLayout }) {
  const props = { products, storeSlug, storeCurrency }
  switch (layout) {
    case "grid-2":
      return <Grid2Layout {...props} />
    case "grid-4":
      return <Grid4Layout {...props} />
    case "list":
      return <ListLayout {...props} />
    case "masonry":
      return <MasonryLayout {...props} />
    default:
      return <Grid3Layout {...props} />
  }
}
