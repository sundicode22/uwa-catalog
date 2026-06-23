"use client"

import { Button } from "@/components/ui/button"
import type { PaginationMeta } from "@/types/api"

interface DataTablePaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  meta,
  onPageChange,
}: DataTablePaginationProps) {
  const { page, totalPages, total, limit } = meta
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {total === 0 ? 0 : start}-{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
