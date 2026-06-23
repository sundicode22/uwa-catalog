import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth"
import { categoryController } from "../controllers/category.controller"
import { createCategoryBody, updateCategoryBody } from "../schemas/category"

export const categoryRoutes = new Elysia()
  .use(authPlugin)
  .get("/stores/:storeId/categories", ({ params }) =>
    categoryController.listByStore(params.storeId)
  )
  .post(
    "/categories",
    ({ userId, body }) => categoryController.create(userId, body),
    { body: createCategoryBody }
  )
  .patch(
    "/categories/:id",
    ({ params, userId, body }) =>
      categoryController.update(userId, params.id, body),
    { body: updateCategoryBody }
  )
  .delete("/categories/:id", ({ params, userId }) =>
    categoryController.delete(userId, params.id)
  )
