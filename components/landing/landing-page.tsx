import dynamic from "next/dynamic"
import type { Session } from "next-auth"
import type { PlanDefinition } from "@/types/domain"
import { LandingCta } from "./landing-cta"
import { LandingFaq } from "./landing-faq"
import { LandingFeatures } from "./landing-features"
import { LandingFooter } from "./landing-footer"
import { LandingGallery } from "./landing-gallery"
import { LandingHeader } from "./landing-header"
import { LandingHero } from "./landing-hero"
import { LandingHighlights } from "./landing-highlights"
import { LandingPricing } from "./landing-pricing"
import { LandingSteps } from "./landing-steps"

const LandingTestimonials = dynamic(
  () =>
    import("./landing-testimonials").then((module) => ({
      default: module.LandingTestimonials,
    })),
  { loading: () => null }
)

interface LandingPageProps {
  session: Session | null
  plans: PlanDefinition[]
}

export function LandingPage({ session, plans }: LandingPageProps) {
  const isLoggedIn = !!session?.user

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <LandingHeader
        isLoggedIn={isLoggedIn}
        user={
          isLoggedIn
            ? {
                name: session?.user?.name,
                email: session?.user?.email,
                image: session?.user?.image,
              }
            : null
        }
      />

      <section className="relative overflow-hidden border-b border-border/60 bg-brand-gradient-hero pt-16">
        <LandingHero isLoggedIn={isLoggedIn} />
      </section>

      <main className="flex-1">
        <LandingGallery />
        <LandingFeatures />
        <LandingHighlights />
        <LandingSteps />
        <LandingPricing isLoggedIn={isLoggedIn} plans={plans} />
        <LandingTestimonials />
        <LandingFaq />
        <LandingCta isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  )
}
