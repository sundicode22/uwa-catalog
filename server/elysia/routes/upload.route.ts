import { Elysia, t } from "elysia"
import { authPlugin } from "../plugins/auth"
import { uploadController } from "../controllers/upload.controller"

export const uploadRoutes = new Elysia()
  .use(authPlugin)
  .post(
    "/uploads",
    ({ userId, body }) =>
      uploadController.uploadImage(userId, body.file, body.folder),
    {
      body: t.Object({
        file: t.File({ maxSize: "10m" }),
        folder: t.Optional(t.String()),
      }),
    }
  )
