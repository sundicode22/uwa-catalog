import Link from "next/link"
import { toast } from "sonner"
import { ApiClientError } from "@/types/api"

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
        window.location.href = "/dashboard/billing"
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
