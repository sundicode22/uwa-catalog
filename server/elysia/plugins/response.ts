import { Elysia } from "elysia"
import { error } from "@/server/lib/response"
import { AppError } from "./errors"

export { AppError, notFound, unauthorized, forbidden } from "./errors"

export const responsePlugin = new Elysia({ name: "response" }).onError(
  ({ error: err, set }) => {
    if (err instanceof AppError) {
      set.status = err.status
      return error(err.code, err.message, err.details)
    }

    if (err && typeof err === "object" && "code" in err) {
      const e = err as {
        code: string
        message: string
        status?: number
        details?: Record<string, string[]>
      }
      set.status = e.status ?? 400
      return error(e.code, e.message, e.details)
    }

    set.status = 500
    return error("INTERNAL_ERROR", "An unexpected error occurred")
  }
)
