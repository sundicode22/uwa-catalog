import { toast } from "sonner"
import { getPathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { ApiClientError } from "@/types/api"

function resolveClientLocale(): Locale {
  if (typeof document === "undefined") return routing.defaultLocale
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/)
  const cookie = match?.[1]
  return cookie && routing.locales.includes(cookie as Locale)
    ? (cookie as Locale)
    : routing.defaultLocale
}

export function isPlanLimitError(error: unknown): error is ApiClientError {
  return (
    error instanceof ApiClientError &&
    (error.code === "PLAN_LIMIT" || error.code === "PLAN_FEATURE")
  )
}

export function showPlanLimitToast(error: ApiClientError) {
  toast.error(error.message, {
    action: {
      label: "Upgrade",
      onClick: () => {
        window.location.href = getPathname({
          locale: resolveClientLocale(),
          href: "/dashboard/billing",
        })
      },
    },
  })
}

export function handlePlanLimitError(error: unknown) {
  if (isPlanLimitError(error)) {
    showPlanLimitToast(error)
    return true
  }
  return false
}
