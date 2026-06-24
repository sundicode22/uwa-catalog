import { Elysia, t } from "elysia"
import { authPlugin, requireAuth } from "../plugins/auth"
import { billingController } from "../controllers/billing.controller"

const planBody = t.Object({
  plan: t.Union([t.Literal("basic"), t.Literal("premium")]),
})

const verifyBody = t.Object({
  reference: t.String(),
})

export const billingRoutes = new Elysia()
  .use(authPlugin)
  .get("/billing", ({ userId }) =>
    billingController.getSummary(requireAuth(userId))
  )
  .post(
    "/billing/stripe/checkout",
    ({ userId, body }) =>
      billingController.createStripeCheckout(requireAuth(userId), body.plan),
    { body: planBody }
  )
  .post("/billing/stripe/portal", ({ userId }) =>
    billingController.createStripePortal(requireAuth(userId))
  )
  .post(
    "/billing/notchpay/checkout",
    ({ userId, body }) =>
      billingController.createNotchPayCheckout(requireAuth(userId), body.plan),
    { body: planBody }
  )
  .post(
    "/billing/notchpay/verify",
    ({ userId, body }) =>
      billingController.verifyNotchPayPayment(requireAuth(userId), body.reference),
    { body: verifyBody }
  )
