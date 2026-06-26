import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
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

export async function LandingPricing({ isLoggedIn, plans }: LandingPricingProps) {
  const t = await getTranslations("landing")
  const tCommon = await getTranslations("common")

  return (
    <section id="pricing" className="border-b border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-brand-gradient-hero p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <p className="text-sm font-medium text-primary">{t("pricingEyebrow")}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("pricingTitle")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("pricingDescription")}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className="gap-1.5 bg-background/80 opacity-50"
                title={t("comingSoon")}
              >
                <CreditCardIcon className="size-3.5" />
                {t("stripeComingSoon")}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 bg-background/80">
                <SmartphoneIcon className="size-3.5" />
                {t("notchPayBadge")}
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
                  ? t("goToDashboard")
                  : t("upgradePlan")
                : t("getStarted")

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
                      {t("mostPopular")}
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
                        tCommon("free")
                      ) : (
                        <>
                          {formatMoney(plan.monthlyPriceUsd, "USD")}
                          <span className="text-base font-normal text-muted-foreground">
                            {t("perMonth")}
                          </span>
                        </>
                      )}
                    </p>
                    {!isFree ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("orXafPerMonth", {
                          amount: plan.monthlyPriceXaf.toLocaleString(),
                        })}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
                      <p className="text-lg font-semibold">{plan.maxStores}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.maxStores === 1 ? t("store") : t("stores")}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
                      <p className="text-lg font-semibold">
                        {plan.maxProductsPerStore.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("productsPerStore")}
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
            {t("pricingFootnote")}
          </p>
        </div>
      </div>
    </section>
  )
}
