import { ProductGridSkeleton } from "@/components/catalog/product-card-skeleton"

export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  )
}
