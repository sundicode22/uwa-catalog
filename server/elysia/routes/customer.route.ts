import { Elysia, t } from "elysia"
import { authPlugin } from "../plugins/auth"
import { customerController } from "../controllers/customer.controller"
import {
  createStoreCustomerBody,
  updateStoreCustomerBody,
} from "../schemas/customer"

export const customerRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/stores/:storeId/customers",
    ({ params, userId, query }) =>
      customerController.list(userId, params.storeId, {
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        search: query.search,
      }),
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  )
  .get("/customers/:customerId", ({ params, userId }) =>
    customerController.getById(userId, params.customerId)
  )
  .post(
    "/customers",
    ({ userId, body }) => customerController.create(userId, body),
    { body: createStoreCustomerBody }
  )
  .patch(
    "/customers/:customerId",
    ({ params, userId, body }) =>
      customerController.update(userId, params.customerId, body),
    { body: updateStoreCustomerBody }
  )
