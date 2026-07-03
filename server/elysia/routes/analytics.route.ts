import { Elysia, t } from "elysia"
import { analyticsController } from "../controllers/analytics.controller"

export const analyticsRoutes = new Elysia().post(
  "/analytics/pageview",
  ({ body, request }) =>
    analyticsController.recordPageView({
      ...body,
      userAgent: body.userAgent ?? request.headers.get("user-agent") ?? undefined,
    }),
  {
    body: t.Object({
      storeSlug: t.String(),
      path: t.String(),
      visitorId: t.String(),
      referrer: t.Optional(t.String()),
      userAgent: t.Optional(t.String()),
    }),
  }
)
