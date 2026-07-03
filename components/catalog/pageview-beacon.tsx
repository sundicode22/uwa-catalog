"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { apiPost } from "@/lib/api/request"

const VISITOR_COOKIE = "catalog_visitor_id"
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365

function getOrCreateVisitorId() {
  if (typeof document === "undefined") return null

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${VISITOR_COOKIE}=`))
  if (match) return decodeURIComponent(match.split("=")[1])

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${VISITOR_MAX_AGE}; SameSite=Lax`
  return id
}

function extractStoreSlug(pathname: string) {
  const match = pathname.match(/^\/c\/([^/]+)/)
  return match?.[1] ?? null
}

export function PageviewBeacon() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    const storeSlug = extractStoreSlug(pathname)
    if (!storeSlug) return

    const visitorId = getOrCreateVisitorId()
    if (!visitorId) return

    const key = `${storeSlug}:${pathname}`
    if (lastSent.current === key) return
    lastSent.current = key

    void apiPost("POST /analytics/pageview", {
      body: {
        storeSlug,
        path: pathname,
        visitorId,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
      },
    }).catch(() => {
      lastSent.current = null
    })
  }, [pathname])

  return null
}
