import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { LANDING_STEP_IMAGES, landingImage } from "@/lib/landing/images"

export async function LandingSteps() {
  const t = await getTranslations("landing")

  const steps = [
    {
      step: "01",
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      step: "02",
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      step: "03",
      title: t("step3Title"),
      description: t("step3Desc"),
    },
  ]

  return (
    <section id="how-it-works" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("stepsEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("stepsTitle")}
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="animate-fade-in-up group overflow-hidden rounded-2xl border border-border/60 bg-card/50"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={landingImage(LANDING_STEP_IMAGES[index].imageId, 640, 400)}
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
