import { t } from "elysia"

export const registerBody = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
})

export const forgotPasswordBody = t.Object({
  email: t.String({ format: "email" }),
})

export const resetPasswordBody = t.Object({
  email: t.String({ format: "email" }),
  token: t.String({ minLength: 1 }),
  password: t.String({ minLength: 8 }),
})
