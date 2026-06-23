export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

export class ApiClientError extends Error {
  code: string
  details?: Record<string, string[]>
  status?: number

  constructor(
    message: string,
    code: string,
    details?: Record<string, string[]>,
    status?: number
  ) {
    super(message)
    this.name = "ApiClientError"
    this.code = code
    this.details = details
    this.status = status
  }
}
