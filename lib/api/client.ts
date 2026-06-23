import axios, { type AxiosRequestConfig } from "axios"
import { ApiClientError, type ApiResponse } from "@/types/api"

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (typeof config.headers.setContentType === "function") {
      config.headers.setContentType(false)
    } else {
      delete config.headers["Content-Type"]
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<unknown>
    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) {
        throw new ApiClientError(
          data.error.message,
          data.error.code,
          data.error.details,
          response.status
        )
      }
      response.data = data.data
      if (data.meta) {
        ;(response as { meta?: unknown }).meta = data.meta
      }
    }
    return response
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as ApiResponse<unknown>
      if (data && typeof data === "object" && "success" in data && !data.success) {
        throw new ApiClientError(
          data.error.message,
          data.error.code,
          data.error.details,
          error.response.status
        )
      }
    }
    return Promise.reject(error)
  }
)

export type ApiClientResponse<T> = {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiClientResponse<T>> {
  const response = await apiClient.request<T>(config)
  return {
    data: response.data,
    meta: (response as { meta?: ApiClientResponse<T>["meta"] }).meta,
  }
}
