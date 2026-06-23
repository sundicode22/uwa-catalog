"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { PencilIcon, TrashIcon } from "lucide-react"
import { createSelectColumn } from "@/components/data-table/select-column"
import { RowActionsMenu } from "@/components/data-table/row-actions-menu"
import type { Category } from "@/types/domain"

export function getCategoryColumns(actions: {
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}): ColumnDef<Category>[] {
  return [
    createSelectColumn<Category>(),
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "sortOrder", header: "Order" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const category = row.original
        return (
          <RowActionsMenu
            actions={[
              {
                label: "Edit",
                icon: <PencilIcon />,
                onClick: () => actions.onEdit(category),
              },
              {
                label: "Delete",
                icon: <TrashIcon />,
                variant: "destructive",
                separatorBefore: true,
                onClick: () => actions.onDelete(category),
              },
            ]}
          />
        )
      },
    },
  ]
}
