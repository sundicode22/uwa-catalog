"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  LANDING_PREVIEW_PRODUCTS,
  LANDING_STORE_LOGO_IMAGE_ID,
  landingImage,
} from "@/lib/landing/images"
import { cn } from "@/lib/utils"

interface LandingPreviewProps {
  className?: string
}

export function LandingPreview({ className }: LandingPreviewProps) {
  const t = useTranslations("landing")

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <div className="absolute -inset-4 rounded-3xl bg-foreground/3 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-[0_24px_80px_-24px_rgb(0_0_0/0.18)]">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <div className="mx-auto truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
            {t("previewUrl")}
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative size-9 overflow-hidden rounded-full border border-border lg:size-10">
                <Image
                  src={landingImage(LANDING_STORE_LOGO_IMAGE_ID, 80)}
                  alt={t("previewStoreName")}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div>
                <p className="text-sm font-semibold lg:text-base">{t("previewStoreName")}</p>
                <p className="text-xs text-muted-foreground">{t("previewStoreTagline")}</p>
              </div>
            </div>
            <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {t("previewCart", { count: 2 })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-3.5">
            {LANDING_PREVIEW_PRODUCTS.map((product, index) => (
              <div
                key={product.name}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={landingImage(product.imageId, 400)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                  />
                </div>
                <div className="space-y-0.5 p-2.5 lg:p-3">
                  <p className="truncate text-xs font-medium lg:text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground lg:text-sm">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
