import type { NextAuthConfig } from "next-auth"
import { hasPlatformAdminRole } from "@/lib/auth/platform-admin-role"
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
      const isAdmin = path.startsWith("/admin")

      if ((isDashboard || isAdmin) && !isLoggedIn) return false

      if (isAdmin && isLoggedIn && !hasPlatformAdminRole(auth.user?.email)) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      if (token.email) {
        token.role = hasPlatformAdminRole(token.email as string)
          ? "platform_admin"
          : "merchant"
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      if (session.user) {
        session.user.role =
          token.role === "platform_admin" ? "platform_admin" : "merchant"
        session.user.isPlatformAdmin = token.role === "platform_admin"
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
