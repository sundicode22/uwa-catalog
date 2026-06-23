import { Elysia } from "elysia"
import { authPlugin } from "../plugins/auth"
import { storeController } from "../controllers/store.controller"
import { createStoreBody, updateStoreBody } from "../schemas/store"

export const storeRoutes = new Elysia()
  .use(authPlugin)
  .get("/stores", ({ userId }) => storeController.list(userId))
  .post(
    "/stores",
    ({ userId, body }) => storeController.create(userId, body),
    { body: createStoreBody }
  )
  .get("/stores/slug/:slug", ({ params }) =>
    storeController.getBySlug(params.slug)
  )
  .get("/stores/:storeId", ({ params, userId }) =>
    storeController.getById(userId, params.storeId)
  )
  .patch(
    "/stores/:storeId",
    ({ params, userId, body }) =>
      storeController.update(userId, params.storeId, body),
    { body: updateStoreBody }
  )
  .get("/stores/:storeId/stats", ({ params, userId }) =>
    storeController.getStats(userId, params.storeId)
  )
