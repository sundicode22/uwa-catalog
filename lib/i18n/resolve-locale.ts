import { cookies, headers } from "next/headers"
import { routing, type Locale } from "@/i18n/routing"

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("NEXT_LOCALE")?.value

  if (cookie && routing.locales.includes(cookie as Locale)) {
    return cookie as Locale
  }

  const accept = (await headers()).get("accept-language")
  if (accept?.toLowerCase().includes("fr")) {
    return "fr"
  }

  return routing.defaultLocale
}
