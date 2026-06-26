import { Elysia } from "elysia"
import { storeCheckoutService } from "@/server/services/store-checkout.service"

export const checkoutRoutes = new Elysia().get(
  "/checkout/notchpay/callback",
  async ({ request }) => {
    const url = new URL(request.url)
    const redirectUrl = await storeCheckoutService.handleCallback(url.search)
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    })
  }
)
