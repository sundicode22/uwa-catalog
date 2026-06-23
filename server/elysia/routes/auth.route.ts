import { Elysia } from "elysia"
import { authController } from "../controllers/auth.controller"
import {
  forgotPasswordBody,
  registerBody,
  resetPasswordBody,
} from "../schemas/auth"

export const authRoutes = new Elysia()
  .post("/auth/register", ({ body }) => authController.register(body), {
    body: registerBody,
  })
  .post(
    "/auth/forgot-password",
    ({ body }) => authController.forgotPassword(body),
    { body: forgotPasswordBody }
  )
  .post("/auth/reset-password", ({ body }) => authController.resetPassword(body), {
    body: resetPasswordBody,
  })
