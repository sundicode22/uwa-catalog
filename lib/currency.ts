import { STORE_CURRENCIES, type StoreCurrencyCode } from "@/lib/currencies"

const VALID_CODES = new Set<string>(STORE_CURRENCIES.map((c) => c.code))

export function resolveStoreCurrency(
  store?: { currency?: string | null } | null,
  fallback: StoreCurrencyCode = "USD"
): StoreCurrencyCode {
  const code = store?.currency?.trim().toUpperCase()
  if (code && VALID_CODES.has(code)) {
    return code as StoreCurrencyCode
  }
  return fallback
}

export function isValidCurrencyCode(code: string): code is StoreCurrencyCode {
  return VALID_CODES.has(code.trim().toUpperCase())
}
