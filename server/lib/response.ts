import type { PaginationMeta } from "@/types/api"

export function success<T>(data: T, meta?: PaginationMeta) {
  return {
    success: true as const,
    data,
    ...(meta ? { meta } : {}),
  }
}

export function error(
  code: string,
  message: string,
  details?: Record<string, string[]>
) {
  return {
    success: false as const,
    error: { code, message, ...(details ? { details } : {}) },
  }
}

export function paginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
