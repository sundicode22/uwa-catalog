export const STORE_CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "NGN", label: "Nigerian Naira (NGN)" },
  { code: "XAF", label: "Central African CFA Franc (XAF)" },
  { code: "GHS", label: "Ghanaian Cedi (GHS)" },
  { code: "KES", label: "Kenyan Shilling (KES)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "BRL", label: "Brazilian Real (BRL)" },
  { code: "MXN", label: "Mexican Peso (MXN)" },
] as const

export type StoreCurrencyCode = (typeof STORE_CURRENCIES)[number]["code"]

export function getCurrencyLabel(code: string) {
  return STORE_CURRENCIES.find((c) => c.code === code)?.label ?? code
}
