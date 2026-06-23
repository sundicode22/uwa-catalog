import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth"
import { productController } from "../controllers/product.controller"
import { createProductBody, updateProductBody } from "../schemas/product"

export const productRoutes = new Elysia()
  .use(authPlugin)
  .get("/stores/:storeId/products", ({ params, query }) =>
    productController.list(params.storeId, {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      categoryId: query.categoryId,
      search: query.search,
      isActive:
        query.isActive === "true"
          ? true
          : query.isActive === "false"
            ? false
            : undefined,
      isFeatured:
        query.isFeatured === "true"
          ? true
          : query.isFeatured === "false"
            ? false
            : undefined,
    })
  )
  .get("/products/:id", ({ params }) => productController.getById(params.id))
  .get("/products/:id/options", ({ params }) =>
    productController.getOptions(params.id)
  )
  .get("/stores/:storeId/products/slug/:slug", ({ params }) =>
    productController.getBySlug(params.storeId, params.slug)
  )
  .post(
    "/products",
    ({ userId, body }) => productController.create(userId, body),
    { body: createProductBody }
  )
  .patch(
    "/products/:id",
    ({ params, userId, body }) =>
      productController.update(userId, params.id, body),
    { body: updateProductBody }
  )
  .delete("/products/:id", ({ params, userId }) =>
    productController.delete(userId, params.id)
  )
