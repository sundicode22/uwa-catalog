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
import { discountRoutes } from "./routes/discount.route"
import { checkoutRoutes } from "./routes/checkout.route"
import { walletRoutes } from "./routes/wallet.route"
import { adminRoutes } from "./routes/admin.route"
import { analyticsRoutes } from "./routes/analytics.route"

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
  .use(discountRoutes)
  .use(checkoutRoutes)
  .use(walletRoutes)
  .use(adminRoutes)
  .use(analyticsRoutes)

export type App = typeof app
