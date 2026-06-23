"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query"
import {
  apiDelete,
  apiGet,
  apiGetPaginated,
  apiPatch,
  apiPost,
} from "@/lib/api/request"
import type {
  EndpointBody,
  EndpointKey,
  EndpointParams,
  EndpointQuery,
  EndpointResponse,
} from "@/types/endpoints"
import { ApiClientError, type PaginationMeta } from "@/types/api"
import { toast } from "sonner"

type QueryOptions<K extends EndpointKey> = Omit<
  UseQueryOptions<EndpointResponse<K>, ApiClientError>,
  "queryKey" | "queryFn"
>

export function useApiQuery<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
    query?: EndpointQuery<K>
    queryKey?: unknown[]
    enabled?: boolean
  } & QueryOptions<K>
) {
  const { params, query, queryKey, enabled, ...rest } = options ?? {}
  return useQuery<EndpointResponse<K>, ApiClientError>({
    queryKey: queryKey ?? [key, params, query],
    queryFn: () => apiGet(key, { params, query }),
    enabled,
    ...rest,
  })
}

type PaginatedResult<T> = {
  data: T[]
  meta?: PaginationMeta
}

export function usePaginatedQuery<K extends EndpointKey>(
  key: K,
  options?: {
    params?: EndpointParams<K>
    query?: EndpointQuery<K>
    queryKey?: unknown[]
    enabled?: boolean
  } & Omit<
    UseQueryOptions<PaginatedResult<unknown>, ApiClientError>,
    "queryKey" | "queryFn"
  >
) {
  const { params, query, queryKey, enabled, ...rest } = options ?? {}
  return useQuery<PaginatedResult<unknown>, ApiClientError>({
    queryKey: queryKey ?? [key, "paginated", params, query],
    queryFn: () => apiGetPaginated(key, { params, query }),
    enabled,
    ...rest,
  })
}

type MutationOptions<K extends EndpointKey> = Omit<
  UseMutationOptions<
    EndpointResponse<K>,
    ApiClientError,
    { params?: EndpointParams<K>; body?: EndpointBody<K> }
  >,
  "mutationFn"
>

export function useApiMutation<K extends EndpointKey>(
  key: K,
  method: "POST" | "PATCH" | "DELETE" = "POST",
  options?: MutationOptions<K> & {
    invalidateKeys?: unknown[][]
    successMessage?: string
  }
) {
  const queryClient = useQueryClient()
  const { invalidateKeys, successMessage, onSuccess, onError, ...rest } =
    options ?? {}

  return useMutation({
    mutationFn: (vars: {
      params?: EndpointParams<K>
      body?: EndpointBody<K>
    }) => {
      if (method === "POST") return apiPost(key, vars)
      if (method === "PATCH") return apiPatch(key, vars)
      return apiDelete(key, vars)
    },
    onSuccess: (data, variables, context, mutation) => {
      if (successMessage) toast.success(successMessage)
      invalidateKeys?.forEach((k) =>
        queryClient.invalidateQueries({ queryKey: k })
      )
      onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(error.message)
      onError?.(error, variables, context, mutation)
    },
    ...rest,
  })
}
