import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-ui"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  isLoading,
  className,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  isLoading?: boolean
  className?: string
}) {
  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {Icon ? (
            <div className="rounded-lg bg-[#F1F3F5] p-2">
              <Icon className="size-4 text-muted-foreground" />
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
