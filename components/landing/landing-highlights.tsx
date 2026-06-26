import Image from "next/image"
import {
  MessageCircleIcon,
  PaletteIcon,
  SmartphoneIcon,
  ZapIcon,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { LANDING_HIGHLIGHT_COLLAGE, landingImage } from "@/lib/landing/images"
import { getSiteName } from "@/lib/seo/site"

export async function LandingHighlights() {
  const t = await getTranslations("landing")
  const siteName = getSiteName()

  const highlights = [
    {
      icon: SmartphoneIcon,
      title: t("highlightMobileTitle"),
      description: t("highlightMobileDesc"),
    },
    {
      icon: MessageCircleIcon,
      title: t("highlightWhatsappTitle"),
      description: t("highlightWhatsappDesc"),
    },
    {
      icon: PaletteIcon,
      title: t("highlightBrandTitle"),
      description: t("highlightBrandDesc"),
    },
    {
      icon: ZapIcon,
      title: t("highlightLaunchTitle"),
      description: t("highlightLaunchDesc"),
    },
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-brand-gradient-hero p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md lg:max-w-none">
              {LANDING_HIGHLIGHT_COLLAGE.map((item, index) => (
                <div
                  key={item.imageId}
                  className={`animate-fade-in-up absolute overflow-hidden rounded-2xl border border-border bg-background shadow-xl ${item.className}`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={landingImage(item.imageId, 600, 450)}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 80vw, 320px"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-medium text-primary">
                  {t("highlightsEyebrow", { appName: siteName })}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t("highlightsTitle")}
                </h2>
                <p className="max-w-lg text-muted-foreground">
                  {t("highlightsDescription")}
                </p>
                <Link
                  href="/signup"
                  className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("highlightsCta")}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((item, index) => (
                  <div
                    key={item.title}
                    className="animate-fade-in-up rounded-2xl border border-border/60 bg-background/80 p-5 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="size-5" />
                    </div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
