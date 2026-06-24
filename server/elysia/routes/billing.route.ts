import { Elysia, t } from "elysia"
import { authPlugin, requireAuth } from "../plugins/auth"
import { billingController } from "../controllers/billing.controller"

const planBody = t.Object({
  plan: t.Union([t.Literal("basic"), t.Literal("premium")]),
})

const verifyBody = t.Object({
  reference: t.String(),
  paymentReference: t.Optional(t.String()),
})

const planIdParams = t.Object({
  planId: t.Union([
    t.Literal("free"),
    t.Literal("basic"),
    t.Literal("premium"),
  ]),
})

const updatePlanBody = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  monthlyPriceUsd: t.Optional(t.Number()),
  monthlyPriceXaf: t.Optional(t.Number()),
  maxStores: t.Optional(t.Number()),
  maxProductsPerStore: t.Optional(t.Number()),
  features: t.Optional(t.Array(t.String())),
  sortOrder: t.Optional(t.Number()),
  isPopular: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
})

export const billingRoutes = new Elysia()
  .use(authPlugin)
  .get("/billing/plans", () => billingController.getPlans())
  .get("/billing", ({ userId, session }) =>
    billingController.getSummary(
      requireAuth(userId),
      session?.user?.email
    )
  )
  .get("/billing/admin/plans", ({ session }) =>
    billingController.getAdminPlans(session?.user?.email)
  )
  .patch(
    "/billing/admin/plans/:planId",
    ({ session, params, body }) =>
      billingController.updatePlan(session?.user?.email, params.planId, body),
    { params: planIdParams, body: updatePlanBody }
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
  .get("/billing/notchpay/callback", ({ query }) =>
    billingController.handleNotchPayCallback(
      query as Record<string, string | undefined>
    )
  )
  .post(
    "/billing/notchpay/verify",
    ({ userId, body }) =>
      billingController.verifyNotchPayPayment(
        requireAuth(userId),
        body.reference,
        body.paymentReference
      ),
    { body: verifyBody }
  )
