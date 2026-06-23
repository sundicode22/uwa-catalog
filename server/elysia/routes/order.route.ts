import { Elysia, t } from "elysia"
import { authPlugin } from "../plugins/auth"
import { orderController } from "../controllers/order.controller"
import { createOrderBody, updateOrderStatusBody } from "../schemas/order"

export const orderRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/stores/:storeId/orders",
    ({ params, userId, query }) =>
      orderController.list(userId, params.storeId, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        search: query.search,
        status: query.status as
          | "pending"
          | "confirmed"
          | "fulfilled"
          | "cancelled"
          | undefined,
      }),
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    }
  )
  .post("/orders", ({ body }) => orderController.create(body), {
    body: createOrderBody,
  })
  .patch(
    "/orders/:id/status",
    ({ params, userId, body }) =>
      orderController.updateStatus(userId, params.id, body),
    { body: updateOrderStatusBody }
  )
