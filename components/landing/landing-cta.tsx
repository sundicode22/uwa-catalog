import { getTranslations } from "next-intl/server"
import { ArrowRightIcon } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { getSiteName } from "@/lib/seo/site"

interface LandingCtaProps {
  isLoggedIn: boolean
}

export async function LandingCta({ isLoggedIn }: LandingCtaProps) {
  const t = await getTranslations("landing")
  const siteName = getSiteName()

  return (
    <section className="border-t border-border bg-brand-gradient py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("ctaDescription", { appName: siteName })}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isLoggedIn ? (
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/dashboard">
                {t("goToDashboard")}
                <ArrowRightIcon />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/signup">
                {t("createYourStore")}
                <ArrowRightIcon />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
