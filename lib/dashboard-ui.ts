import { cn } from "@/lib/utils"

/**
 * Light dashboard surface — cool soft gray canvas + pure white cards.
 * Pairs with the warm orange primary.
 */
export const DASHBOARD_CANVAS_BG = "bg-[#F7F8FA]"
export const DASHBOARD_CANVAS_HEX = "#F7F8FA"
export const DASHBOARD_CARD_BG = "bg-white"
export const DASHBOARD_MUTED_SURFACE = "bg-[#F1F3F5]"

export const DASHBOARD_CARD_CLASS =
  "border-0 bg-white shadow-none"

export const DASHBOARD_CARD_ROUNDED = cn(
  DASHBOARD_CARD_CLASS,
  "overflow-hidden rounded-2xl"
)

export function dashboardCardClassName(...extra: Array<string | undefined | false>) {
  return cn(DASHBOARD_CARD_CLASS, ...extra)
}
