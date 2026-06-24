import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  LayoutGridIcon,
  SparklesIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LANDING_HERO_FLOATERS, landingImage } from "@/lib/landing/images"
import { getSiteName } from "@/lib/seo/site"
import { cn } from "@/lib/utils"
import { LandingPreview } from "./landing-preview"

interface LandingHeroProps {
  isLoggedIn: boolean
}

export function LandingHero({ isLoggedIn }: LandingHeroProps) {
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
            Catalogs built for modern sellers
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Share your products.
              <span className="block text-brand-gradient">Take orders in minutes.</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {siteName} helps you publish a beautiful storefront, manage inventory,
              and accept orders — including WhatsApp checkout — without building a
              full e-commerce site.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isLoggedIn ? (
              <Button asChild size="lg" className="h-11 px-6">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href="/signup">
                    Start for free
                    <ArrowRightIcon />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6">
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <LayoutGridIcon className="size-4" />
              Multiple catalog layouts
            </span>
            <span className="hidden sm:inline">No code required</span>
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
