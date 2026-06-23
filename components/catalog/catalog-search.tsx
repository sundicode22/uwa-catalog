"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XIcon } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface CatalogSearchProps {
  storeSlug: string
  className?: string
  inputClassName?: string
}

export function CatalogSearch({
  storeSlug,
  className,
  inputClassName,
}: CatalogSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get("q") ?? ""
  const [value, setValue] = useState(urlQuery)
  const debounced = useDebounce(value, 300)

  useEffect(() => {
    setValue(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    if (debounced === urlQuery) return

    const params = new URLSearchParams(searchParams.toString())
    if (debounced.trim()) {
      params.set("q", debounced.trim())
    } else {
      params.delete("q")
    }

    const query = params.toString()
    router.replace(query ? `/c/${storeSlug}?${query}` : `/c/${storeSlug}`, {
      scroll: false,
    })
  }, [debounced, urlQuery, router, searchParams, storeSlug])

  return (
    <div className={cn("relative", className)}>
      <SearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products..."
        className={cn("pr-9", inputClassName)}
        wrapperClassName="w-full"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setValue("")}
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
