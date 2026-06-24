import Image from "next/image"
import {
  LANDING_GALLERY_IMAGES,
  landingImage,
} from "@/lib/landing/images"

export function LandingGallery() {
  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Storefronts in the wild</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple products, beautiful catalogs
          </h2>
          <p className="mt-3 text-muted-foreground">
            Totes, mugs, sneakers, candles, and more — showcase everyday products
            with clean photos and layouts that sell.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {LANDING_GALLERY_IMAGES.map((item, index) => (
            <div
              key={item.imageId}
              className={`animate-fade-in-up group relative min-h-[140px] overflow-hidden rounded-2xl border border-border bg-muted sm:min-h-[180px] ${item.className}`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Image
                src={landingImage(item.imageId, 800, 600)}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.alt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
