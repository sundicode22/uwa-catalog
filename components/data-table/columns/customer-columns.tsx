"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { PencilIcon } from "lucide-react"
import { createSelectColumn } from "@/components/data-table/select-column"
import { RowActionsMenu } from "@/components/data-table/row-actions-menu"
import { formatDateTime, formatMoney } from "@/lib/format"
import type { StoreCustomer } from "@/types/domain"

export function getCustomerColumns(actions: {
  onEdit: (customer: StoreCustomer) => void
  currency?: string
}): ColumnDef<StoreCustomer>[] {
  const currency = actions.currency ?? "USD"

  return [
    createSelectColumn<StoreCustomer>(),
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => row.original.city ?? "—",
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
    },
    {
      accessorKey: "totalSpent",
      header: "Total spent",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {formatMoney(row.original.totalSpent, currency)}
        </span>
      ),
    },
    {
      accessorKey: "lastOrderAt",
      header: "Last order",
      cell: ({ row }) =>
        row.original.lastOrderAt ? (
          <time
            dateTime={row.original.lastOrderAt}
            className="whitespace-nowrap text-sm tabular-nums text-muted-foreground"
          >
            {formatDateTime(row.original.lastOrderAt)}
          </time>
        ) : (
          "—"
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <RowActionsMenu
            actions={[
              {
                label: "Edit",
                icon: <PencilIcon />,
                onClick: () => actions.onEdit(customer),
              },
            ]}
          />
        )
      },
    },
  ]
}
