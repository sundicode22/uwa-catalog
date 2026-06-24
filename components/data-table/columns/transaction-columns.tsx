"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { createSelectColumn } from "@/components/data-table/select-column"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { StoreTransactionListItem, StoreTransactionStatus } from "@/types/domain"

const statusColors: Record<
  StoreTransactionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  completed: "default",
  voided: "destructive",
}

const paymentMethodLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  catalog_checkout: "Catalog checkout",
}

export function getTransactionColumns(currency = "USD"): ColumnDef<StoreTransactionListItem>[] {
  return [
    createSelectColumn<StoreTransactionListItem>(),
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.original.customerPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {formatMoney(row.original.amount, row.original.currency || currency)}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => {
        const method = row.original.paymentMethod
        if (!method) return "—"
        return (
          <Badge variant="outline">
            {paymentMethodLabels[method] ?? method.replace(/_/g, " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.reference?.slice(0, 8) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <time
          dateTime={row.original.createdAt}
          className="whitespace-nowrap text-sm tabular-nums text-muted-foreground"
        >
          {formatDateTime(row.original.createdAt)}
        </time>
      ),
    },
  ]
}
