import type { Session } from "next-auth"
import { LandingCta } from "./landing-cta"
import { LandingFaq } from "./landing-faq"
import { LandingFeatures } from "./landing-features"
import { LandingFooter } from "./landing-footer"
import { LandingGallery } from "./landing-gallery"
import { LandingHeader } from "./landing-header"
import { LandingHero } from "./landing-hero"
import { LandingHighlights } from "./landing-highlights"
import { LandingSteps } from "./landing-steps"
import { LandingTestimonials } from "./landing-testimonials"

interface LandingPageProps {
  session: Session | null
}

export function LandingPage({ session }: LandingPageProps) {
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
        <LandingTestimonials />
        <LandingFaq />
        <LandingCta isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  )
}
