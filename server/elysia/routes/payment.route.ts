import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth"
import { paymentController } from "../controllers/payment.controller"

export const paymentRoutes = new Elysia()
  .use(authPlugin)
  .get("/stores/:storeId/payment-providers", ({ params, userId }) =>
    paymentController.listByStore(userId, params.storeId)
  )
