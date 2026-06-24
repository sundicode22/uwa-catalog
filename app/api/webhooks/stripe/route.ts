import { NextRequest, NextResponse } from "next/server"
import { stripeBillingService } from "@/server/services/billing/stripe.service"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("stripe-signature")
    await stripeBillingService.handleWebhook(rawBody, signature)
    return NextResponse.json({ received: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed"
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status: number }).status
        : 400
    return NextResponse.json({ error: message }, { status })
  }
}
