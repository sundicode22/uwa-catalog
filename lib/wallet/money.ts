const ZERO_DECIMAL_CURRENCIES = new Set(["XAF", "JPY", "KRW", "VND"])

export function toMinorUnits(amount: string | number, currency: string): number {
  const value = typeof amount === "string" ? parseFloat(amount) : amount
  if (Number.isNaN(value)) return 0
  const code = currency.toUpperCase()
  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return Math.round(value)
  }
  return Math.round(value * 100)
}

export function fromMinorUnits(minor: number, currency: string): string {
  const code = currency.toUpperCase()
  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return minor.toFixed(0)
  }
  return (minor / 100).toFixed(2)
}

export function calculatePlatformFee(grossMinor: number, feePercent: number): number {
  if (feePercent <= 0 || grossMinor <= 0) return 0
  return Math.round((grossMinor * feePercent) / 100)
}
