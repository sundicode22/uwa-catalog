import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BILLING_PLANS } from "@/lib/billing/plans"
import { formatMoney } from "@/lib/format"
import type { SubscriptionPlan } from "@/lib/billing/plans"

const PLAN_ORDER: SubscriptionPlan[] = ["free", "basic", "premium"]

interface LandingPricingProps {
  isLoggedIn: boolean
}

export function LandingPricing({ isLoggedIn }: LandingPricingProps) {
  const plans = PLAN_ORDER.map((id) => BILLING_PLANS[id])

  return (
    <section id="pricing" className="border-b border-border bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple plans that grow with you
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, then upgrade when you need more stores, products, or
            premium storefront layouts. Pay with card (Stripe) or mobile money
            (NotchPay) in XAF.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isPopular = plan.id === "basic"
            const isFree = plan.id === "free"
            const ctaHref = isLoggedIn
              ? isFree
                ? "/dashboard"
                : "/dashboard/billing"
              : "/signup"
            const ctaLabel = isLoggedIn
              ? isFree
                ? "Go to dashboard"
                : "Upgrade plan"
              : "Get started"

            return (
              <div
                key={plan.id}
                className={`animate-fade-in-up relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md ${
                  isPopular
                    ? "border-primary/40 shadow-sm ring-1 ring-primary/20"
                    : "border-border hover:border-primary/25"
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {isPopular ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                ) : null}

                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-3xl font-semibold tracking-tight">
                    {isFree ? "Free" : formatMoney(plan.monthlyPriceUsd, "USD")}
                    {!isFree ? (
                      <span className="text-base font-normal text-muted-foreground">
                        /mo
                      </span>
                    ) : null}
                  </p>
                  {!isFree ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      or {plan.monthlyPriceXaf.toLocaleString()} XAF / mo via
                      NotchPay
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

                <Button
                  asChild
                  className="mt-8 w-full"
                  variant={isPopular ? "default" : "outline"}
                >
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
          All paid plans renew monthly. Stripe subscriptions auto-renew; NotchPay
          plans are extended for 30 days after each successful payment.
        </p>
      </div>
    </section>
  )
}
