import { AppError } from "@/server/elysia/plugins/errors"

const NOTCHPAY_API_BASE = "https://api.notchpay.co"

export type NotchPayTransaction = {
  id?: string
  reference?: string
  status?: string
  currency?: string
  amount?: number
  customer?: {
    id?: string
    email?: string
    name?: string
  }
  payment_method?: string
}

export type NotchPayPaymentResponse = {
  authorization_url?: string
  authorizationUrl?: string
  transaction?: NotchPayTransaction
  payment?: {
    authorization_url?: string
    transaction?: NotchPayTransaction
  }
  message?: string
  error?: { message?: string }
}

export type NotchPayPaymentCreateInput = {
  amount: number
  currency: string
  customer: {
    email: string
    name?: string
    phone?: string
  }
  reference: string
  callback: string
  description: string
}

export const normalizeNotchPayPayment = (payload: NotchPayPaymentResponse) => {
  const transaction =
    payload.transaction ?? payload.payment?.transaction ?? null
  const authorizationUrl =
    payload.authorization_url ??
    payload.authorizationUrl ??
    payload.payment?.authorization_url ??
    null

  return { transaction, authorizationUrl, raw: payload }
}

const notchpayRequest = async <T>(
  secretKey: string,
  path: string,
  init: RequestInit
): Promise<T> => {
  const response = await fetch(`${NOTCHPAY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: secretKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

  let data: T & NotchPayPaymentResponse = {} as T & NotchPayPaymentResponse
  try {
    data = (await response.json()) as T & NotchPayPaymentResponse
  } catch {
    data = {} as T & NotchPayPaymentResponse
  }

  if (!response.ok) {
    throw new AppError(
      "NOTCHPAY_ERROR",
      data.message ??
        data.error?.message ??
        `NotchPay request failed (${response.status})`,
      502
    )
  }

  return data
}

export class NotchPayAPI {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  payments = {
    create: (input: NotchPayPaymentCreateInput) =>
      notchpayRequest<NotchPayPaymentResponse>(this.secretKey, "/payments", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    retrieve: (reference: string) =>
      notchpayRequest<NotchPayPaymentResponse>(
        this.secretKey,
        `/payments/${encodeURIComponent(reference)}`,
        { method: "GET" }
      ),
  }
}
