import { Elysia } from "elysia"
import { auth } from "@/auth"
import { unauthorized } from "./errors"

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async () => {
    const session = await auth()
    return {
      session,
      userId: session?.user?.id ?? null,
    }
  }
)

export function requireAuth(userId: string | null): string {
  if (!userId) unauthorized("Unauthorized")
  return userId
}
