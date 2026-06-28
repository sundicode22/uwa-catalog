import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { auth } from "@/auth"
import { LandingPage } from "@/components/landing/landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { buildLandingJsonLd } from "@/lib/seo/json-ld"
import { buildSiteMetadata } from "@/lib/seo/site-metadata"
import { getSiteName } from "@/lib/seo/site"
import { planService } from "@/server/services/billing/plan.service"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  const siteName = getSiteName()

  return buildSiteMetadata({
    siteName,
    title: t("siteTitle", { appName: siteName }),
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    locale,
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [session, plans, t] = await Promise.all([
    auth(),
    planService.getAllPlans(),
    getTranslations({ locale, namespace: "metadata" }),
  ])

  const description = t("description")

  return (
    <>
      <JsonLd data={buildLandingJsonLd(description)} />
      <LandingPage session={session} plans={plans} />
    </>
  )
}
