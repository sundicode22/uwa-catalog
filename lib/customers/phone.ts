export function normalizeCustomerPhone(phone: string) {
  return phone.replace(/\D/g, "")
}
