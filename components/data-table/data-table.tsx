"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "./data-table-pagination"
import type { PaginationMeta } from "@/types/api"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: PaginationMeta
  onPageChange?: (page: number) => void
  isLoading?: boolean
  enableSelection?: boolean
  getRowId?: (row: TData) => string
  onSelectionChange?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPageChange,
  isLoading,
  enableSelection = true,
  getRowId,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: enableSelection,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        if (onSelectionChange) {
          const selected = Object.keys(next)
            .map((id) => data.find((row, index) => (getRowId ? getRowId(row) : String(index)) === id))
            .filter(Boolean) as TData[]
          onSelectionChange(selected)
        }
        return next
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ?? ((_, index) => String(index)),
    manualPagination: true,
    pageCount: meta?.totalPages ?? 1,
  })

  return (
    <div className="space-y-4">
      <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={`${rowIndex}-${column.id ?? columnIndex}`}>
                      <Skeleton className="h-4 w-full max-w-[12rem]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      {meta && onPageChange && (
        <DataTablePagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  )
}
