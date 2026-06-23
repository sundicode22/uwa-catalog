"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { PencilIcon, StarIcon, TrashIcon, ToggleLeftIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { createSelectColumn } from "@/components/data-table/select-column"
import { RowActionsMenu } from "@/components/data-table/row-actions-menu"
import { formatMoney } from "@/lib/format"
import { formatStockColumn } from "@/lib/inventory"
import type { Product } from "@/types/domain"

export function getProductColumns(actions: {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleActive: (product: Product) => void
  onToggleFeatured?: (product: Product) => void
  currency?: string
}): ColumnDef<Product>[] {
  const currency = actions.currency ?? "USD"
  return [
    createSelectColumn<Product>(),
    {
      accessorKey: "images",
      header: "Image",
      cell: ({ row }) => {
        const image = row.original.images?.[0]?.url
        return image ? (
          <div className="relative size-10 overflow-hidden border border-border">
            <Image src={image} alt={row.original.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="size-10 border border-border bg-muted" />
        )
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <span>{row.original.name}</span>
          {((row.original.optionCounts?.variationGroups ?? 0) > 0 ||
            (row.original.optionCounts?.modifierGroups ?? 0) > 0 ||
            (row.original.optionCounts?.sizes ?? 0) > 0) && (
            <Badge variant="outline" className="ml-2 text-xs">
              Customizable
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name ?? "—",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatMoney(row.original.price, currency),
    },
    {
      accessorKey: "inventory",
      header: "Stock",
      cell: ({ row }) => {
        const label = formatStockColumn(row.original.inventory)
        if (row.original.inventory === null || row.original.inventory === undefined) {
          return <span className="text-muted-foreground">{label}</span>
        }
        return (
          <Badge
            variant={row.original.inventory > 0 ? "outline" : "destructive"}
          >
            {label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.isActive}
            onCheckedChange={() => actions.onToggleActive(row.original)}
          />
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isFeatured}
          onCheckedChange={() => actions.onToggleFeatured?.(row.original)}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original
        return (
          <RowActionsMenu
            actions={[
              {
                label: "Edit",
                icon: <PencilIcon />,
                onClick: () => actions.onEdit(product),
              },
              {
                label: product.isActive ? "Deactivate" : "Activate",
                icon: <ToggleLeftIcon />,
                onClick: () => actions.onToggleActive(product),
              },
              ...(actions.onToggleFeatured
                ? [
                    {
                      label: product.isFeatured ? "Unfeature" : "Feature",
                      icon: <StarIcon />,
                      onClick: () => actions.onToggleFeatured!(product),
                    },
                  ]
                : []),
              {
                label: "Delete",
                icon: <TrashIcon />,
                variant: "destructive" as const,
                separatorBefore: true,
                onClick: () => actions.onDelete(product),
              },
            ]}
          />
        )
      },
    },
  ]
}
