"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

type Testimonial = {
  name: string
  role: string
  quote: string
}

export function LandingTestimonials() {
  const t = useTranslations("landing")
  const testimonials = t.raw("testimonials") as Testimonial[]
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <section id="testimonials" className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("testimonialsEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("testimonialsTitle")}
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 bg-[radial-gradient(circle,oklch(0.65_0.16_52/0.08),transparent_70%)]"
            aria-hidden
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center">
            <div className="relative mb-8 flex size-56 items-center justify-center sm:size-64">
              {testimonials.map((item, index) => {
                const offset = index - selected
                const normalized =
                  ((offset + testimonials.length + Math.floor(testimonials.length / 2)) %
                    testimonials.length) -
                  Math.floor(testimonials.length / 2)
                const angle = normalized * 42
                const radius = 108
                const x = Math.sin((angle * Math.PI) / 180) * radius
                const y = Math.cos((angle * Math.PI) / 180) * radius * 0.35
                const isActive = index === selected

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "absolute overflow-hidden rounded-full border border-border/80 bg-muted shadow-lg transition-all duration-500",
                      isActive
                        ? "z-10 size-14 ring-4 ring-primary/25 sm:size-16"
                        : "z-0 size-12 opacity-70 hover:opacity-100 sm:size-14"
                    )}
                    style={{
                      transform: `translate(${x}px, ${y}px) scale(${isActive ? 1.1 : 0.9})`,
                    }}
                    aria-label={t("viewTestimonial", { name: item.name })}
                  >
                    <span className="sr-only">{item.name}</span>
                  </button>
                )
              })}
            </div>

            <Carousel
              setApi={setApi}
              opts={{ align: "center", loop: true }}
              plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((item) => (
                  <CarouselItem key={item.name}>
                    <figure className="mx-auto max-w-2xl text-center">
                      <blockquote className="text-lg leading-relaxed text-foreground/90 sm:text-xl">
                        “{item.quote}”
                      </blockquote>
                      <figcaption className="mt-6">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </figcaption>
                    </figure>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
