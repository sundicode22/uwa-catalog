import { planService } from "../server/services/billing/plan.service"

async function main() {
  const plans = await planService.seedDefaults()
  console.log(`Seeded ${plans.length} billing plan definitions:`)
  for (const plan of plans) {
    console.log(
      `  - ${plan.id}: ${plan.name} (${plan.monthlyPriceUsd} USD / ${plan.monthlyPriceXaf} XAF)`
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
