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
import { DashboardPanel } from "@/components/dashboard/dashboard-panel"
import { DataTablePagination } from "./data-table-pagination"
import { cn } from "@/lib/utils"
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
  className?: string
  /** Search / filters rendered inside the same card above the table. */
  toolbar?: React.ReactNode
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
  className,
  toolbar,
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
            .map((id) =>
              data.find((row, index) =>
                (getRowId ? getRowId(row) : String(index)) === id
              )
            )
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

  const footer =
    meta && onPageChange ? (
      <DataTablePagination meta={meta} onPageChange={onPageChange} />
    ) : null

  return (
    <DashboardPanel
      className={cn(className)}
      toolbar={toolbar}
      footer={footer}
    >
      <Table containerClassName="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-none">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-slate-100 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-9 bg-[#FAFBFC] px-3 text-sm font-medium capitalize text-slate-500 first:pl-4 last:pr-4"
                >
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
              <TableRow key={rowIndex} className="border-slate-100">
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={`${rowIndex}-${column.id ?? columnIndex}`}
                    className="px-3 py-2 first:pl-4 last:pr-4"
                  >
                    <Skeleton className="h-4 w-full max-w-48" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-slate-100 hover:bg-[#FAFBFC]/data-[state=selected]:bg-[#F7F8FA]"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-3 py-2 first:pl-4 last:pr-4"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 px-4 text-center text-muted-foreground"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DashboardPanel>
  )
}
