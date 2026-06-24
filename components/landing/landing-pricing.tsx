import Link from "next/link"
import {
  CheckIcon,
  CreditCardIcon,
  LayersIcon,
  SmartphoneIcon,
  StoreIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/format"
import type { PlanDefinition } from "@/types/domain"

interface LandingPricingProps {
  isLoggedIn: boolean
  plans: PlanDefinition[]
}

export function LandingPricing({ isLoggedIn, plans }: LandingPricingProps) {
  return (
    <section id="pricing" className="border-b border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-brand-gradient-hero p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <p className="text-sm font-medium text-primary">Pricing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple plans that grow with you
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free, then upgrade when you need more stores, products, or
              premium storefront layouts.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className="gap-1.5 bg-background/80 opacity-50"
                title="Coming soon"
              >
                <CreditCardIcon className="size-3.5" />
                Stripe · Coming soon
              </Badge>
              <Badge variant="secondary" className="gap-1.5 bg-background/80">
                <SmartphoneIcon className="size-3.5" />
                NotchPay · XAF
              </Badge>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan, index) => {
              const isPopular = plan.isPopular ?? plan.id === "basic"
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
                  className={`animate-fade-in-up relative flex flex-col rounded-2xl border bg-background/90 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isPopular
                      ? "border-primary/50 shadow-md ring-1 ring-primary/25 lg:scale-[1.02]"
                      : "border-border/70 hover:border-primary/30"
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {isPopular ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most popular
                    </Badge>
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.description}
                      </p>
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
                        or {plan.monthlyPriceXaf.toLocaleString()} XAF / mo via
                        mobile money
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
                      <p className="text-lg font-semibold">{plan.maxStores}</p>
                      <p className="text-xs text-muted-foreground">
                        store{plan.maxStores === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
                      <p className="text-lg font-semibold">
                        {plan.maxProductsPerStore.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        products / store
                      </p>
                    </div>
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
            All paid plans renew monthly. NotchPay plans extend for 30 days after
            each successful mobile money payment.
          </p>
        </div>
      </div>
    </section>
  )
}
