export function getPlatformAdminEmails() {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isPlatformAdmin(email: string | null | undefined) {
  if (!email) return false
  return getPlatformAdminEmails().includes(email.toLowerCase())
}
