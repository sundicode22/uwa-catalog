import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { CatalogLayout } from "@/types/domain"

const layoutGridClass: Record<CatalogLayout, string> = {
  "grid-2": "grid grid-cols-1 gap-4 sm:grid-cols-2",
  "grid-3": "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
  "grid-4": "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
  list: "flex flex-col gap-3",
  masonry: "columns-1 gap-4 sm:columns-2 lg:columns-3",
}

function ProductCardSkeleton({ layout }: { layout: CatalogLayout }) {
  const isList = layout === "list"
  const isMasonryItem = layout === "masonry"

  const card = (
    <Skeleton
      className={cn(
        "w-full rounded-xl",
        isList ? "aspect-[16/9]" : "aspect-square"
      )}
    />
  )

  if (isMasonryItem) {
    return <div className="mb-4 break-inside-avoid">{card}</div>
  }

  return card
}

export function CatalogLayoutSkeleton({
  layout,
  count = 8,
}: {
  layout: CatalogLayout
  count?: number
}) {
  return (
    <div className={layoutGridClass[layout]}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} layout={layout} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="aspect-square w-full rounded-xl" />
      ))}
    </div>
  )
}
