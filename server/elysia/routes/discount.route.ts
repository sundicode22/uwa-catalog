import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth"
import { discountController } from "../controllers/discount.controller"
import {
  createDiscountCodeBody,
  updateDiscountCodeBody,
  validateDiscountBody,
} from "../schemas/discount"

export const discountRoutes = new Elysia()
  .use(authPlugin)
  .get("/stores/:storeId/discounts", ({ params, userId }) =>
    discountController.list(userId, params.storeId)
  )
  .post(
    "/discounts",
    ({ userId, body }) => discountController.create(userId, body),
    { body: createDiscountCodeBody }
  )
  .patch(
    "/discounts/:id",
    ({ userId, params, body }) =>
      discountController.update(userId, params.id, body),
    { body: updateDiscountCodeBody }
  )
  .delete("/discounts/:id", ({ userId, params }) =>
    discountController.delete(userId, params.id)
  )
  .post("/discounts/validate", ({ body }) => discountController.validate(body), {
    body: validateDiscountBody,
  })
