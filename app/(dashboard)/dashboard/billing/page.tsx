"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckIcon,
  CreditCardIcon,
  SmartphoneIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/hooks/use-store"
import {
  useBillingSummary,
  useNotchPayCheckout,
  useNotchPayVerify,
  useStripeCheckout,
  useStripePortal,
} from "@/hooks/use-billing"
import { formatMoney } from "@/lib/format"
import type { AccountSubscriptionPlan, PlanDefinition } from "@/types/domain"

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const atLimit = used >= limit

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={atLimit ? "font-medium text-orange-600" : ""}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${atLimit ? "bg-orange-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function PlanCard({
  plan,
  currentPlan,
  onStripe,
  onNotchPay,
  stripeLoading,
  notchpayLoading,
}: {
  plan: PlanDefinition
  currentPlan: AccountSubscriptionPlan
  onStripe: () => void
  onNotchPay: () => void
  stripeLoading: boolean
  notchpayLoading: boolean
}) {
  const isCurrent = plan.id === currentPlan
  const isFree = plan.id === "free"

  return (
    <Card className={isCurrent ? "border-orange-500/50 shadow-sm" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{plan.name}</CardTitle>
          {isCurrent ? <Badge>Current</Badge> : null}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-semibold">
            {isFree ? "Free" : formatMoney(plan.monthlyPriceUsd, "USD")}
            {!isFree ? (
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            ) : null}
          </p>
          {!isFree ? (
            <p className="text-xs text-muted-foreground">
              or {plan.monthlyPriceXaf.toLocaleString()} XAF / mo via mobile money
            </p>
          ) : null}
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-orange-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      {!isFree && !isCurrent ? (
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full sm:flex-1"
            onClick={onStripe}
            disabled={stripeLoading || notchpayLoading}
          >
            <CreditCardIcon className="size-4" />
            {stripeLoading ? "Redirecting..." : "Pay with Stripe"}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:flex-1"
            onClick={onNotchPay}
            disabled={stripeLoading || notchpayLoading}
          >
            <SmartphoneIcon className="size-4" />
            {notchpayLoading ? "Redirecting..." : "Pay with NotchPay"}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const { store } = useStore()
  const { data, isLoading } = useBillingSummary()
  const stripeCheckout = useStripeCheckout()
  const notchpayCheckout = useNotchPayCheckout()
  const notchpayVerify = useNotchPayVerify()
  const stripePortal = useStripePortal()

  useEffect(() => {
    const checkout = searchParams.get("checkout")
    const reference = searchParams.get("reference")

    if (checkout === "success") {
      toast.success("Subscription updated successfully")
      return
    }
    if (checkout === "canceled") {
      toast.message("Checkout canceled")
      return
    }
    if (checkout === "notchpay" && reference) {
      notchpayVerify
        .mutateAsync({ body: { reference } })
        .then((result) => {
          if (result.status === "complete") {
            toast.success("NotchPay payment confirmed. Your plan is active.")
          } else {
            toast.message(
              "Payment received. Your plan will update once NotchPay confirms the transaction."
            )
          }
        })
        .catch(() => {
          // Error toast handled by useApiMutation
        })
    } else if (checkout === "notchpay") {
      toast.message(
        "Complete payment on your phone. Your plan updates when payment is confirmed."
      )
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-muted-foreground">Unable to load billing information.</p>
  }

  const { subscription, usage, plans, limits } = data
  const productCount = store ? (usage.productsByStore[store.id] ?? 0) : 0
  const renewalDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : null

  async function upgrade(
    plan: Exclude<AccountSubscriptionPlan, "free">,
    provider: "stripe" | "notchpay"
  ) {
    try {
      const mutation = provider === "stripe" ? stripeCheckout : notchpayCheckout
      const result = await mutation.mutateAsync({ body: { plan } })
      if (result.url) {
        window.location.href = result.url
        return
      }

      toast.error(
        provider === "stripe"
          ? "Unable to start Stripe checkout."
          : "Unable to start NotchPay checkout."
      )
    } catch {
      // useApiMutation already shows the API error toast.
    }
  }

  async function openPortal() {
    try {
      const result = await stripePortal.mutateAsync({})
      if (result.url) window.location.href = result.url
    } catch {
      // useApiMutation already shows the API error toast.
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and usage limits
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current plan</CardTitle>
          <CardDescription>
            {plans.find((p) => p.id === subscription.plan)?.name ?? subscription.plan}
            {renewalDate && subscription.provider !== "none"
              ? ` · Renews ${renewalDate}`
              : ""}
            {subscription.provider === "stripe" ? " · Billed via Stripe" : ""}
            {subscription.provider === "notchpay" ? " · Billed via NotchPay" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar label="Stores" used={usage.storeCount} limit={limits.maxStores} />
          {store ? (
            <UsageBar
              label={`Products in ${store.name}`}
              used={productCount}
              limit={limits.maxProductsPerStore}
            />
          ) : null}
        </CardContent>
        {subscription.provider === "stripe" && subscription.plan !== "free" ? (
          <CardFooter>
            <Button variant="outline" onClick={openPortal} disabled={stripePortal.isPending}>
              {stripePortal.isPending ? "Opening..." : "Manage subscription"}
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={subscription.plan}
            stripeLoading={stripeCheckout.isPending}
            notchpayLoading={notchpayCheckout.isPending}
            onStripe={() => upgrade(plan.id as Exclude<AccountSubscriptionPlan, "free">, "stripe")}
            onNotchPay={() =>
              upgrade(plan.id as Exclude<AccountSubscriptionPlan, "free">, "notchpay")
            }
          />
        ))}
      </div>
    </div>
  )
}
