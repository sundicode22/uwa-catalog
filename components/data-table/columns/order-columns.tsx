"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderItemsCell } from "@/components/data-table/order-items-cell"
import { createSelectColumn } from "@/components/data-table/select-column"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { Order, OrderStatus } from "@/types/domain"

const statusColors: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  fulfilled: "outline",
  cancelled: "destructive",
}

export function getOrderColumns(actions: {
  onStatusChange: (order: Order, status: OrderStatus) => void
  currency?: string
}): ColumnDef<Order>[] {
  const currency = actions.currency ?? "USD"

  return [
    createSelectColumn<Order>(),
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "customerPhone", header: "Phone" },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <OrderItemsCell items={row.original.items} currency={currency} />
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {formatMoney(row.original.total, currency)}
        </span>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.source}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) =>
            actions.onStatusChange(row.original, value as OrderStatus)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["pending", "confirmed", "fulfilled", "cancelled"] as OrderStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  <Badge variant={statusColors[status]}>{status}</Badge>
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
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
