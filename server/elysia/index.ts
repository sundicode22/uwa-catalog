import { Elysia } from "elysia"
import { responsePlugin } from "./plugins/response"
import { authPlugin } from "./plugins/auth"
import {
  authRoutes,
  healthRoutes,
  storeRoutes,
  categoryRoutes,
  productRoutes,
  orderRoutes,
  uploadRoutes,
  paymentRoutes,
  billingRoutes,
  customerRoutes,
  transactionRoutes,
} from "./routes"

export const app = new Elysia({ prefix: "/api" })
  .use(responsePlugin)
  .use(authPlugin)
  .use(authRoutes)
  .use(healthRoutes)
  .use(storeRoutes)
  .use(categoryRoutes)
  .use(productRoutes)
  .use(orderRoutes)
  .use(uploadRoutes)
  .use(paymentRoutes)
  .use(billingRoutes)
  .use(customerRoutes)
  .use(transactionRoutes)

export type App = typeof app
