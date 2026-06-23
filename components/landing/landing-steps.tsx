import Image from "next/image"
import { LANDING_STEP_IMAGES, landingImage } from "@/lib/landing/images"

const STEPS = [
  {
    step: "01",
    title: "Create your store",
    description: "Sign up, add your store name, logo, and catalog settings in minutes.",
  },
  {
    step: "02",
    title: "Add products",
    description:
      "Upload images, set prices, track inventory, and configure sizes or add-ons.",
  },
  {
    step: "03",
    title: "Share & sell",
    description:
      "Send your catalog link. Customers order via checkout or WhatsApp — you manage it all.",
  },
]

export function LandingSteps() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Live in three steps
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((item, index) => (
            <div
              key={item.step}
              className="animate-fade-in-up group overflow-hidden rounded-2xl border border-border/60 bg-card/50"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={landingImage(LANDING_STEP_IMAGES[index].seed, 640, 400)}
                  alt={LANDING_STEP_IMAGES[index].alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-3xl font-semibold tracking-tight text-primary/40">
                  {item.step}
                </span>
              </div>
              <div className="space-y-2 p-6">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
