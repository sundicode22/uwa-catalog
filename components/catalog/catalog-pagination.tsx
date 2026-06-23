"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PaginationMeta } from "@/types/api"

interface CatalogPaginationProps {
  meta?: PaginationMeta
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

export function CatalogPagination({
  meta,
  onPageChange,
  disabled,
  className,
}: CatalogPaginationProps) {
  if (!meta || meta.totalPages <= 1) return null

  const { page, totalPages } = meta

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label="Product pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <span className="min-w-[3.25rem] text-center text-xs tabular-nums text-muted-foreground">
        {page}/{totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  )
}
