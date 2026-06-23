import { apiRequest } from "./client"
import { ApiClientError, type ApiResponse, type PaginationMeta } from "@/types/api"
import type { UploadResult } from "@/types/domain"
import type {
  EndpointBody,
  EndpointKey,
  EndpointParams,
  EndpointQuery,
  EndpointResponse,
  HttpMethod,
} from "@/types/endpoints"

function buildPath(
  template: string,
  params?: Record<string, string>
): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    template
  )
}

function parseEndpoint(key: EndpointKey): {
  method: HttpMethod
  path: string
} {
  const [method, path] = key.split(" ") as [HttpMethod, string]
  return { method, path }
}

export async function apiGet<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
    query?: EndpointQuery<K>
  }
): Promise<EndpointResponse<K>> {
  const { method, path } = parseEndpoint(key)
  const url = buildPath(path, options?.params as Record<string, string>)
  const { data } = await apiRequest<EndpointResponse<K>>({
    method,
    url,
    params: options?.query,
  })
  return data
}

export async function apiPost<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
    body?: EndpointBody<K>
  }
): Promise<EndpointResponse<K>> {
  const { method, path } = parseEndpoint(key)
  const url = buildPath(path, options?.params as Record<string, string>)
  const { data } = await apiRequest<EndpointResponse<K>>({
    method,
    url,
    data: options?.body,
  })
  return data
}

export async function apiPatch<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
    body?: EndpointBody<K>
  }
): Promise<EndpointResponse<K>> {
  const { method, path } = parseEndpoint(key)
  const url = buildPath(path, options?.params as Record<string, string>)
  const { data } = await apiRequest<EndpointResponse<K>>({
    method,
    url,
    data: options?.body,
  })
  return data
}

export async function apiDelete<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
  }
): Promise<EndpointResponse<K>> {
  const { method, path } = parseEndpoint(key)
  const url = buildPath(path, options?.params as Record<string, string>)
  const { data } = await apiRequest<EndpointResponse<K>>({
    method,
    url,
  })
  return data
}

export async function apiUpload(options: {
  file: File
  folder?: string
}): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", options.file)
  if (options.folder) formData.append("folder", options.folder)

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiClientError(
      "Upload failed",
      "UPLOAD_FAILED",
      undefined,
      response.status
    )
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const apiPayload = payload as ApiResponse<UploadResult>
    if (apiPayload.success) return apiPayload.data
    throw new ApiClientError(
      apiPayload.error.message,
      apiPayload.error.code,
      apiPayload.error.details,
      response.status
    )
  }

  if (
    payload &&
    typeof payload === "object" &&
    "type" in payload &&
    (payload as { type: string }).type === "validation"
  ) {
    throw new ApiClientError(
      (payload as { message?: string }).message ?? "Invalid upload",
      "VALIDATION_ERROR",
      undefined,
      response.status
    )
  }

  throw new ApiClientError(
    response.status === 401 ? "Unauthorized" : "Upload failed",
    response.status === 401 ? "UNAUTHORIZED" : "UPLOAD_FAILED",
    undefined,
    response.status
  )
}

export async function apiGetPaginated<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
    query?: EndpointQuery<K>
  }
): Promise<{
  data: unknown[]
  meta?: PaginationMeta
}> {
  const { method, path } = parseEndpoint(key)
  const url = buildPath(path, options?.params as Record<string, string>)
  const response = await apiRequest<unknown[]>({
    method,
    url,
    params: options?.query,
  })
  return {
    data: Array.isArray(response.data) ? response.data : [],
    meta: response.meta,
  }
}
