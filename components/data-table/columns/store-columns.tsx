"use client"

import { Link } from "@/i18n/navigation"
import {
  CopyIcon,
  ExternalLinkIcon,
  SettingsIcon,
  Share2Icon,
  StoreIcon,
} from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RowActionsMenu } from "@/components/data-table/row-actions-menu"
import {
  copyStoreLink,
  getStorePath,
  getStoreUrl,
  shareStoreLink,
} from "@/lib/store-url"
import type { Store } from "@/types/domain"

export function getStoreColumns(actions: {
  activeStoreId?: string
  onSwitch: (store: Store) => void
  onOpenSettings: (store: Store) => void
}): ColumnDef<Store>[] {
  return [
    {
      accessorKey: "name",
      header: "Store",
      cell: ({ row }) => {
        const store = row.original
        const isActive = store.id === actions.activeStoreId
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{store.name}</span>
            {isActive ? (
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.slug}
        </span>
      ),
    },
    {
      id: "link",
      header: "Catalog link",
      cell: ({ row }) => {
        const store = row.original
        const url = getStoreUrl(store.slug)
        const path = getStorePath(store.slug)

        return (
          <div className="flex max-w-xs items-center gap-1">
            <Link
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {path}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => copyStoreLink(url)}
              aria-label={`Copy link for ${store.name}`}
            >
              <CopyIcon className="size-3.5" />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "default" : "secondary"}>
          {row.original.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "storefrontTier",
      header: "Storefront",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.storefrontTier === "premium" ? "Premium" : "Basic"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const store = row.original
        const url = getStoreUrl(store.slug)
        const path = getStorePath(store.slug)

        return (
          <RowActionsMenu
            actions={[
              {
                label: "Copy link",
                icon: <CopyIcon />,
                onClick: () => copyStoreLink(url),
              },
              {
                label: "Share link",
                icon: <Share2Icon />,
                onClick: () => shareStoreLink(store, url),
              },
              {
                label: "Open catalog",
                icon: <ExternalLinkIcon />,
                onClick: () => window.open(path, "_blank", "noopener,noreferrer"),
              },
              {
                label: "Switch to store",
                icon: <StoreIcon />,
                separatorBefore: true,
                onClick: () => actions.onSwitch(store),
              },
              {
                label: "Settings",
                icon: <SettingsIcon />,
                onClick: () => actions.onOpenSettings(store),
              },
            ]}
          />
        )
      },
    },
  ]
}
