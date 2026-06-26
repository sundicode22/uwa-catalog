import NextAuth from "next-auth"
import createIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authConfig } from "./auth.config"
import { routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)
const { auth } = NextAuth(authConfig)

function catalogLocaleResponse(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/c/")) {
    return null
  }

  const response = NextResponse.next()
  const cookie = request.cookies.get("NEXT_LOCALE")?.value
  const locale =
    cookie && routing.locales.includes(cookie as (typeof routing.locales)[number])
      ? cookie
      : request.headers.get("accept-language")?.toLowerCase().includes("fr")
        ? "fr"
        : routing.defaultLocale
  response.headers.set("x-next-intl-locale", locale)
  return response
}

export const proxy = auth((request) => {
  const catalogResponse = catalogLocaleResponse(request)
  if (catalogResponse) {
    return catalogResponse
  }

  if (request.nextUrl.pathname.startsWith("/api")) {
    return
  }

  return intlMiddleware(request)
})

export const config = {
  matcher: [
    "/",
    "/(en|fr)/:path*",
    "/c/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
