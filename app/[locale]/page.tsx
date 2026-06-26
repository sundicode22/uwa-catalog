import { setRequestLocale } from "next-intl/server"
import { auth } from "@/auth"
import { LandingPage } from "@/components/landing/landing-page"
import { planService } from "@/server/services/billing/plan.service"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [session, plans] = await Promise.all([auth(), planService.getAllPlans()])
  return <LandingPage session={session} plans={plans} />
}
