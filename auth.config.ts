import type { NextAuthConfig } from "next-auth"
import { stripLocalePrefix } from "@/lib/i18n/pathname"

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const path = stripLocalePrefix(nextUrl.pathname)
      const isAuthPage =
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/auth/error")
      const isDashboard = path.startsWith("/dashboard")

      if (isDashboard && !isLoggedIn) return false
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
