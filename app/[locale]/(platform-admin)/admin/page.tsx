"use client"

import { useTranslations } from "next-intl"
import { StatCard } from "@/components/dashboard/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminOverview } from "@/hooks/use-admin"
import { formatMoney } from "@/lib/format"
import { fromMinorUnits } from "@/lib/wallet/money"

export default function AdminOverviewPage() {
  const t = useTranslations("admin")
  const { data, isLoading } = useAdminOverview()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{t("platformOverview")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("platformOverviewDescription")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("totalUsers")} value={String(data.users)} />
        <StatCard label={t("totalStores")} value={String(data.stores)} />
        <StatCard label={t("orders7d")} value={String(data.orders7d)} />
        <StatCard
          label={t("pendingWithdrawals")}
          value={String(data.pendingWithdrawals)}
        />
        <StatCard label={t("pageViews7d")} value={String(data.pageViews7d)} />
        <StatCard
          label={t("uniqueVisitors7d")}
          value={String(data.uniqueVisitors7d)}
        />
        <StatCard label={t("gmv30d")} value={formatMoney(data.gmv30d, "USD")} />
        <StatCard
          label={t("walletLiabilities")}
          value={formatMoney(
            fromMinorUnits(data.walletLiabilitiesMinor, "XAF"),
            "XAF"
          )}
        />
      </div>

      {data.ordersTrend.length > 0 ? (
        <div className="rounded-xl border border-border bg-background p-4">
          <h2 className="mb-3 text-sm font-medium">Orders trend (7d)</h2>
          <div className="flex items-end gap-2">
            {data.ordersTrend.map((point) => (
              <div key={point.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/80"
                  style={{
                    height: `${Math.max(8, point.count * 12)}px`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {point.day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
