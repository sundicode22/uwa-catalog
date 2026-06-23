"use client"

import { useState } from "react"
import { ChevronDownIcon, PackageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatMoney } from "@/lib/format"
import { formatStockColumn } from "@/lib/inventory"
import { formatSelectionsLabel } from "@/lib/product-options"
import { cn } from "@/lib/utils"
import type { OrderItem } from "@/types/domain"

interface OrderItemsCellProps {
  items: OrderItem[]
  currency?: string
}

export function OrderItemsCell({ items, currency = "USD" }: OrderItemsCellProps) {
  const [open, setOpen] = useState(false)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const firstLabel = items[0]?.displayName ?? items[0]?.name ?? "Item"

  if (items.length === 0) {
    return <span className="text-sm text-muted-foreground">No items</span>
  }

  const summary =
    items.length === 1
      ? `${firstLabel} ×${items[0].quantity}`
      : `${itemCount} items · ${firstLabel}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex max-w-[220px] items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm transition-colors",
            "hover:border-border hover:bg-muted/50",
            open && "border-border bg-muted/50"
          )}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {itemCount}
          </Badge>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            {summary}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-80 p-0"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <PackageIcon className="size-4 text-muted-foreground" />
            Order items ({itemCount})
          </p>
        </div>
        <ul className="max-h-64 overflow-y-auto p-2">
          {items.map((item, index) => {
            const label = item.displayName ?? item.name
            const extras = item.selections
              ? formatSelectionsLabel(item.selections)
              : ""
            const stockLabel =
              item.inventory === null || item.inventory === undefined
                ? null
                : formatStockColumn(item.inventory)

            return (
              <li
                key={`${item.productId}-${index}`}
                className="rounded-lg px-2 py-2.5 text-sm hover:bg-muted/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{label}</p>
                    {extras ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {extras}
                      </p>
                    ) : null}
                    {stockLabel ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Stock now: {stockLabel}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums text-muted-foreground">
                      ×{item.quantity}
                    </p>
                    <p className="mt-0.5 text-xs font-medium tabular-nums">
                      {formatMoney(
                        parseFloat(item.price) * item.quantity,
                        currency
                      )}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
