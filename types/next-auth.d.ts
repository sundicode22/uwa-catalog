import "next-auth"
import { DefaultSession } from "next-auth"
import type { UserRole } from "@/lib/auth/platform-admin-role"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      isPlatformAdmin: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: UserRole
  }
}
