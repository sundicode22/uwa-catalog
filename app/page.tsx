import { auth } from "@/auth"
import { LandingPage } from "@/components/landing/landing-page"
import { planService } from "@/server/services/billing/plan.service"

export default async function HomePage() {
  const [session, plans] = await Promise.all([auth(), planService.getAllPlans()])
  return <LandingPage session={session} plans={plans} />
}
