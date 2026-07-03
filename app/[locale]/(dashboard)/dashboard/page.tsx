"use client"

import dynamic from "next/dynamic"
import {
  BanknoteIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  PackageCheckIcon,
  PackageIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore, useStoreStats } from "@/hooks/use-store"
import { useWalletSummary } from "@/hooks/use-wallet"
import { formatMoney } from "@/lib/format"
import { resolveStoreCurrency } from "@/lib/currency"
import { Link } from "@/i18n/navigation"

const OrdersTrendChart = dynamic(
  () =>
    import("@/components/dashboard/orders-trend-chart").then((module) => ({
      default: module.OrdersTrendChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
  }
)

const RevenueChart = dynamic(
  () =>
    import("@/components/dashboard/revenue-chart").then((module) => ({
      default: module.RevenueChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
  }
)

const OrderStatusChart = dynamic(
  () =>
    import("@/components/dashboard/order-status-chart").then((module) => ({
      default: module.OrderStatusChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
  }
)

export default function DashboardPage() {
  const { store, stores } = useStore()
  const { data: stats, isLoading } = useStoreStats(store?.id)
  const { data: wallet, isLoading: walletLoading } = useWalletSummary()

  if (!store && stores.length === 0) {
    return <DashboardWelcome />
  }

  const currency = resolveStoreCurrency(store)
  const primaryWallet = wallet?.accounts?.[0]
  const walletCurrency = primaryWallet?.currency ?? currency
  const walletBalance = primaryWallet?.availableBalanceFormatted ?? "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{store?.name}</p>
        </div>
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-2 rounded-lg border border-black/5 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:bg-[#F9FAFB]"
        >
          <WalletIcon className="size-4 text-primary" />
          Wallet
        </Link>
      </div>

      {(stats?.lowStockProducts ?? 0) > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {stats?.lowStockProducts} product{(stats?.lowStockProducts ?? 0) === 1 ? "" : "s"} running low on stock.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet balance"
          value={formatMoney(walletBalance, walletCurrency)}
          hint={
            wallet?.pendingWithdrawalsCount
              ? `${wallet.pendingWithdrawalsCount} pending withdrawal(s)`
              : "Order earnings after platform fee"
          }
          icon={WalletIcon}
          isLoading={walletLoading}
        />
        <StatCard
          label="Total revenue"
          value={formatMoney(stats?.totalRevenue ?? "0", currency)}
          hint={`${stats?.totalOrders ?? 0} lifetime orders`}
          icon={BanknoteIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Orders this week"
          value={stats?.ordersThisWeek ?? 0}
          hint={`${stats?.pendingOrders ?? 0} pending`}
          icon={ClipboardListIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Active products"
          value={stats?.activeProducts ?? 0}
          hint={`${stats?.totalProducts ?? 0} total`}
          icon={PackageIcon}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OrdersTrendChart
          data={stats?.ordersTrend ?? []}
          isLoading={isLoading}
          currency={currency}
        />
        <RevenueChart
          data={stats?.ordersTrend ?? []}
          isLoading={isLoading}
          currency={currency}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <OrderStatusChart
            data={stats?.orderStatusBreakdown ?? []}
            isLoading={isLoading}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard
            label="Pending"
            value={stats?.pendingOrders ?? 0}
            icon={ClockIcon}
            isLoading={isLoading}
          />
          <StatCard
            label="Confirmed"
            value={stats?.confirmedOrders ?? 0}
            icon={CheckCircle2Icon}
            isLoading={isLoading}
          />
          <StatCard
            label="Fulfilled"
            value={stats?.fulfilledOrders ?? 0}
            icon={PackageCheckIcon}
            isLoading={isLoading}
          />
          <StatCard
            label="Cancelled"
            value={stats?.cancelledOrders ?? 0}
            icon={XCircleIcon}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
