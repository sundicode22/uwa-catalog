import Image from "next/image"
import Link from "next/link"
import {
  MessageCircleIcon,
  PaletteIcon,
  SmartphoneIcon,
  ZapIcon,
} from "lucide-react"
import { LANDING_HIGHLIGHT_COLLAGE, landingImage } from "@/lib/landing/images"
import { getSiteName } from "@/lib/seo/site"

const HIGHLIGHTS = [
  {
    icon: SmartphoneIcon,
    title: "Mobile-first catalogs",
    description: "Designed for shoppers on phones — fast browsing, easy checkout.",
  },
  {
    icon: MessageCircleIcon,
    title: "WhatsApp native",
    description: "Meet customers where they already chat and buy.",
  },
  {
    icon: PaletteIcon,
    title: "Brand-ready layouts",
    description: "Polished storefronts without custom front-end work.",
  },
  {
    icon: ZapIcon,
    title: "Fast to launch",
    description: "Go from signup to live catalog link in under an hour.",
  },
]

export function LandingHighlights() {
  const siteName = getSiteName()

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
                <p className="text-sm font-medium text-primary">Why {siteName}</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Built for sellers who move fast
                </h2>
                <p className="max-w-lg text-muted-foreground">
                  Skip the heavy e-commerce stack. Publish a catalog, manage orders,
                  and keep inventory aligned — all from one dashboard.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Start your store today →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {HIGHLIGHTS.map((item, index) => (
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
