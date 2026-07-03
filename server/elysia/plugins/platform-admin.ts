import { isPlatformAdmin } from "@/lib/billing/platform-admin"
import { hasPlatformAdminRole } from "@/lib/auth/platform-admin-role"
import { forbidden } from "./errors"

export function requirePlatformAdmin(email: string | null | undefined) {
  if (!hasPlatformAdminRole(email)) forbidden("Platform admin access required")
}

/** @deprecated Use hasPlatformAdminRole from lib/auth/platform-admin-role */
export { isPlatformAdmin }
