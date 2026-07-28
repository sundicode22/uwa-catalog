import { cn } from "@/lib/utils"
import { DASHBOARD_CARD_ROUNDED } from "@/lib/dashboard-ui"

type DashboardPanelProps = {
  children: React.ReactNode
  className?: string
  /** Optional toolbar / filter row rendered above the main content with a divider. */
  toolbar?: React.ReactNode
  /** Optional footer (e.g. pagination) rendered below with a divider. */
  footer?: React.ReactNode
}

/**
 * Primary content shell for dashboard sections — white card on the soft gray canvas.
 */
export function DashboardPanel({
  children,
  className,
  toolbar,
  footer,
}: DashboardPanelProps) {
  return (
    <section className={cn(DASHBOARD_CARD_ROUNDED, className)}>
      {toolbar ? (
        <div className="px-4 pt-5 pb-4 sm:px-5 sm:pt-6">{toolbar}</div>
      ) : null}
      <div
        className={cn(
          "min-w-0 px-4 sm:px-5",
          toolbar ? "pb-5 sm:pb-6" : "py-5 sm:py-6",
          footer && "pb-4"
        )}
      >
        {children}
      </div>
      {footer ? (
        <div className="px-4 py-4 sm:px-5 sm:py-5">{footer}</div>
      ) : null}
    </section>
  )
}
