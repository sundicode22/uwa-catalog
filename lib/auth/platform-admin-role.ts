import { isPlatformAdmin } from "@/lib/billing/platform-admin"

export const PLATFORM_ADMIN_ROLE = "platform_admin" as const

export type UserRole = "merchant" | typeof PLATFORM_ADMIN_ROLE

export function resolveUserRole(email: string | null | undefined): UserRole {
  return isPlatformAdmin(email) ? PLATFORM_ADMIN_ROLE : "merchant"
}

export function hasPlatformAdminRole(email: string | null | undefined) {
  return resolveUserRole(email) === PLATFORM_ADMIN_ROLE
}
