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

export type App = typeof app
