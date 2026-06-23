"use client"

import { useEffect, useState } from "react"
import {
  Grid2x2Icon,
  Grid3x3Icon,
  LayoutGridIcon,
  LayoutListIcon,
  ColumnsIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CatalogLayout } from "@/types/domain"

const layouts: { value: CatalogLayout; icon: React.ReactNode; label: string }[] = [
  { value: "grid-2", icon: <Grid2x2Icon className="size-4" />, label: "2 cols" },
  { value: "grid-3", icon: <Grid3x3Icon className="size-4" />, label: "3 cols" },
  { value: "grid-4", icon: <LayoutGridIcon className="size-4" />, label: "4 cols" },
  { value: "list", icon: <LayoutListIcon className="size-4" />, label: "List" },
  { value: "masonry", icon: <ColumnsIcon className="size-4" />, label: "Masonry" },
]

interface LayoutSwitcherProps {
  defaultLayout: CatalogLayout
  storeSlug: string
  onChange: (layout: CatalogLayout) => void
}

export function LayoutSwitcher({
  defaultLayout,
  storeSlug,
  onChange,
}: LayoutSwitcherProps) {
  const storageKey = `catalog-layout-${storeSlug}`
  const [layout, setLayout] = useState<CatalogLayout>(defaultLayout)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as CatalogLayout | null
    if (saved) {
      setLayout(saved)
      onChange(saved)
    } else {
      onChange(defaultLayout)
    }
  }, [defaultLayout, storageKey, onChange])

  function handleChange(value: CatalogLayout) {
    setLayout(value)
    localStorage.setItem(storageKey, value)
    onChange(value)
  }

  return (
    <div className="flex items-center gap-1">
      {layouts.map((l) => (
        <Button
          key={l.value}
          variant={layout === l.value ? "default" : "outline"}
          size="icon"
          className="size-8"
          onClick={() => handleChange(l.value)}
          title={l.label}
        >
          {l.icon}
        </Button>
      ))}
    </div>
  )
}
