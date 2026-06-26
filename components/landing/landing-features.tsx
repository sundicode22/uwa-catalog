import {
  BarChart3Icon,
  LayersIcon,
  MessageCircleIcon,
  PackageIcon,
  PaletteIcon,
  ShoppingBagIcon,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getSiteName } from "@/lib/seo/site"

export async function LandingFeatures() {
  const t = await getTranslations("landing")
  const siteName = getSiteName()

  const features = [
    {
      icon: ShoppingBagIcon,
      title: t("featureStorefrontsTitle"),
      description: t("featureStorefrontsDesc"),
    },
    {
      icon: PaletteIcon,
      title: t("featureLayoutsTitle"),
      description: t("featureLayoutsDesc"),
    },
    {
      icon: LayersIcon,
      title: t("featureOptionsTitle"),
      description: t("featureOptionsDesc"),
    },
    {
      icon: PackageIcon,
      title: t("featureInventoryTitle"),
      description: t("featureInventoryDesc"),
    },
    {
      icon: MessageCircleIcon,
      title: t("featureWhatsappTitle"),
      description: t("featureWhatsappDesc"),
    },
    {
      icon: BarChart3Icon,
      title: t("featureInsightsTitle"),
      description: t("featureInsightsDesc"),
    },
  ]

  return (
    <section id="features" className="border-b border-border py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <p className="text-sm font-medium text-primary">{t("featuresEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("featuresDescription", { appName: siteName })}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
