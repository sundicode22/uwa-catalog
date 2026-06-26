import { routing } from "@/i18n/routing"

export function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/"
    }
  }
  return pathname
}

export function pathMatches(pathname: string, url: string): boolean {
  const path = stripLocalePrefix(pathname)
  if (path === url) return true
  if (url === "/dashboard") return false
  return path.startsWith(`${url}/`)
}
