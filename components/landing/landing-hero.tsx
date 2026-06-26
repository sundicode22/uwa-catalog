"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  ArrowRightIcon,
  LayoutGridIcon,
  SparklesIcon,
} from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { LANDING_HERO_FLOATERS, landingImage } from "@/lib/landing/images"
import { getSiteName } from "@/lib/seo/site"
import { cn } from "@/lib/utils"
import { LandingPreview } from "./landing-preview"

interface LandingHeroProps {
  isLoggedIn: boolean
}

export function LandingHero({ isLoggedIn }: LandingHeroProps) {
  const t = useTranslations("landing")
  const tNav = useTranslations("nav")
  const siteName = getSiteName()

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/15 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-64 rounded-full bg-[oklch(0.7_0.12_40/0.2)] blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-center lg:gap-x-12 lg:py-28 xl:gap-x-16">
        <div className="relative z-10 min-w-0 animate-fade-in-up space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
            <SparklesIcon className="size-3.5" />
            {t("badge")}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {t("heroTitle")}
              <span className="block text-brand-gradient">{t("heroTitleAccent")}</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("heroDescription", { appName: siteName })}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isLoggedIn ? (
              <Button asChild size="lg" className="h-11 px-6">
                <Link href="/dashboard">
                  {t("openDashboard")}
                  <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href="/signup">
                    {t("startFree")}
                    <ArrowRightIcon />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6">
                  <Link href="/login">{tNav("login")}</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <LayoutGridIcon className="size-4" />
              {t("multipleLayouts")}
            </span>
            <span className="hidden sm:inline">{t("noCode")}</span>
          </div>
        </div>

        <div
          className={cn(
            "relative min-w-0",
            "mx-auto w-full max-w-xl sm:max-w-2xl lg:mx-0 lg:max-w-none",
            "lg:w-[calc(100%+max(0px,(100vw-72rem)/2-1.5rem))]",
            "animate-fade-in-up lg:animate-float"
          )}
          style={{ animationDelay: "200ms" }}
        >
          {LANDING_HERO_FLOATERS.map((item) => (
            <div
              key={item.imageId}
              className={`absolute overflow-hidden rounded-xl border-2 border-background shadow-lg ${item.className}`}
            >
              <Image
                src={landingImage(item.imageId, 200)}
                alt={item.alt}
                width={96}
                height={96}
                className="size-full object-cover"
              />
            </div>
          ))}
          <LandingPreview className="w-full" />
        </div>
      </div>
    </div>
  )
}
