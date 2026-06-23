export class AppError extends Error {
  code: string
  status: number
  details?: Record<string, string[]>

  constructor(
    code: string,
    message: string,
    status = 400,
    details?: Record<string, string[]>
  ) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
    this.details = details
  }
}

export function notFound(message = "Resource not found"): never {
  throw new AppError("NOT_FOUND", message, 404)
}

export function unauthorized(message = "Unauthorized"): never {
  throw new AppError("UNAUTHORIZED", message, 401)
}

export function forbidden(message = "Forbidden"): never {
  throw new AppError("FORBIDDEN", message, 403)
}

export function badRequest(message = "Bad request"): never {
  throw new AppError("BAD_REQUEST", message, 400)
}
