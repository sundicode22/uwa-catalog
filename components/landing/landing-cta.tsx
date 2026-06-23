import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSiteName } from "@/lib/seo/site"

interface LandingCtaProps {
  isLoggedIn: boolean
}

export function LandingCta({ isLoggedIn }: LandingCtaProps) {
  const siteName = getSiteName()

  return (
    <section className="border-t border-border bg-brand-gradient py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to launch your catalog?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join {siteName} and give customers a polished way to browse and order
          your products today.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isLoggedIn ? (
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/dashboard">
                Go to dashboard
                <ArrowRightIcon />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/signup">
                Create your store
                <ArrowRightIcon />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
