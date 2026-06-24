import { Elysia, t } from "elysia"
import { authPlugin } from "../plugins/auth"
import { transactionController } from "../controllers/transaction.controller"

export const transactionRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/stores/:storeId/transactions",
    ({ params, userId, query }) =>
      transactionController.list(userId, params.storeId, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        search: query.search,
        status: query.status as
          | "pending"
          | "completed"
          | "voided"
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
