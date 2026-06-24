"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  CheckIcon,
  CreditCardIcon,
  LayersIcon,
  SmartphoneIcon,
  StoreIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/hooks/use-store"
import {
  useBillingSummary,
  useNotchPayCheckout,
} from "@/hooks/use-billing"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AccountSubscriptionPlan, PlanDefinition } from "@/types/domain"
import { BillingPlanAdmin } from "@/components/dashboard/billing-plan-admin"

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const overLimit = used > limit
  const pct =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-background/80 p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span
          className={cn(
            "tabular-nums",
            overLimit
              ? "font-semibold text-destructive"
              : used >= limit
                ? "font-medium text-orange-600"
                : "text-muted-foreground"
          )}
        >
          {used} / {limit}
          {overLimit ? (
            <span className="ml-1.5 text-xs font-normal">Over limit</span>
          ) : null}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            overLimit
              ? "bg-destructive"
              : used >= limit
                ? "bg-orange-500"
                : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function PlanCard({
  plan,
  currentPlan,
  onNotchPay,
  notchpayLoading,
}: {
  plan: PlanDefinition
  currentPlan: AccountSubscriptionPlan
  onNotchPay: () => void
  notchpayLoading: boolean
}) {
  const isCurrent = plan.id === currentPlan
  const isFree = plan.id === "free"
  const isPopular = plan.isPopular ?? plan.id === "basic"

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 transition-all",
        isCurrent
          ? "border-primary/50 shadow-md ring-1 ring-primary/20"
          : isPopular
            ? "border-primary/30 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
            : "border-border hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
      )}
    >
      {isPopular && !isCurrent ? (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most popular
        </Badge>
      ) : null}
      {isCurrent ? (
        <Badge className="absolute -top-3 right-4" variant="secondary">
          Current
        </Badge>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {plan.id === "premium" ? (
            <LayersIcon className="size-5" />
          ) : (
            <StoreIcon className="size-5" />
          )}
        </div>
      </div>

      <div className="mt-6 border-b border-border/60 pb-6">
        <p className="text-3xl font-semibold tracking-tight">
          {isFree ? (
            "Free"
          ) : (
            <>
              {formatMoney(plan.monthlyPriceUsd, "USD")}
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </>
          )}
        </p>
        {!isFree ? (
          <p className="mt-1 text-xs text-muted-foreground">
            or {plan.monthlyPriceXaf.toLocaleString()} XAF / mo via mobile money
          </p>
        ) : null}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      {!isFree && !isCurrent ? (
        <div className="mt-8">
          <Button
            className="w-full"
            onClick={onNotchPay}
            disabled={notchpayLoading}
          >
            <SmartphoneIcon className="size-4" />
            {notchpayLoading ? "Redirecting..." : "Pay with NotchPay"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { store } = useStore()
  const { data, isLoading } = useBillingSummary()
  const notchpayCheckout = useNotchPayCheckout()
  const checkoutToastShown = useRef<string | null>(null)

  useEffect(() => {
    const checkout = searchParams.get("checkout")
    if (!checkout) return

    const toastKey = `${checkout}:${searchParams.toString()}`
    if (checkoutToastShown.current === toastKey) return
    checkoutToastShown.current = toastKey

    if (checkout === "success") {
      toast.success("NotchPay payment confirmed. Your plan is active.")
      queryClient.invalidateQueries({ queryKey: ["billing"] })
      return
    }
    if (checkout === "pending") {
      toast.message(
        "Payment received. Your plan will update once NotchPay confirms the transaction."
      )
      queryClient.invalidateQueries({ queryKey: ["billing"] })
      return
    }
    if (checkout === "failed") {
      toast.error("Payment was not completed. Please try again.")
      return
    }
    if (checkout === "canceled") {
      toast.message("Checkout canceled")
    }
  }, [searchParams, queryClient])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-muted-foreground">Unable to load billing information.</p>
  }

  const { subscription, usage, plans, limits, canManagePlans } = data
  const productCount = store ? (usage.productsByStore[store.id] ?? 0) : 0
  const renewalDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : null
  const currentPlanName =
    plans.find((p) => p.id === subscription.plan)?.name ?? subscription.plan

  async function upgrade(plan: Exclude<AccountSubscriptionPlan, "free">) {
    try {
      const result = await notchpayCheckout.mutateAsync({ body: { plan } })
      if (result.url) {
        window.location.href = result.url
        return
      }

      toast.error("Unable to start NotchPay checkout.")
    } catch {
      // useApiMutation already shows the API error toast.
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription, usage limits, and payment methods
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-brand-gradient-hero p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Current plan</p>
            <h2 className="text-2xl font-semibold">{currentPlanName}</h2>
            <p className="text-sm text-muted-foreground">
              {renewalDate && subscription.provider !== "none"
                ? `Renews ${renewalDate}`
                : "No active paid subscription"}
              {subscription.provider === "stripe" ? " · Stripe (unavailable)" : ""}
              {subscription.provider === "notchpay" ? " · NotchPay" : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <UsageBar label="Stores" used={usage.storeCount} limit={limits.maxStores} />
          {store ? (
            <UsageBar
              label={`Products in ${store.name}`}
              used={productCount}
              limit={limits.maxProductsPerStore}
            />
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Available plans</h2>
            <p className="text-sm text-muted-foreground">
              Upgrade when you need more stores, products, or premium layouts
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 opacity-50"
              title="Coming soon"
            >
              <CreditCardIcon className="size-3.5" />
              Stripe · Coming soon
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <SmartphoneIcon className="size-3.5" />
              NotchPay
            </Badge>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={subscription.plan}
              notchpayLoading={notchpayCheckout.isPending}
              onNotchPay={() =>
                upgrade(plan.id as Exclude<AccountSubscriptionPlan, "free">)
              }
            />
          ))}
        </div>
      </section>

      {canManagePlans ? <BillingPlanAdmin /> : null}
    </div>
  )
}
