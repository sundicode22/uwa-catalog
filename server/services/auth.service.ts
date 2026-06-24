import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { and, eq, gt } from "drizzle-orm"
import { db, users, verificationTokens } from "@/lib/db"
import { AppError } from "@/server/elysia/plugins/errors"
import { subscriptionService } from "@/server/services/subscription.service"
import type {
  ForgotPasswordInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/domain"

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase()

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (existing) {
      throw new AppError(
        "EMAIL_EXISTS",
        "An account with this email already exists",
        409
      )
    }

    const passwordHash = await hash(input.password, 12)
    const [user] = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        email,
        passwordHash,
      })
      .returning()

    await subscriptionService.ensureForUser(user.id)

    return { id: user.id, email: user.email }
  },

  async requestPasswordReset(input: ForgotPasswordInput) {
    const email = input.email.trim().toLowerCase()
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (!user?.passwordHash) {
      return { sent: true as const }
    }

    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS)

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email))

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    console.log("Password reset link:", resetUrl)

    return { sent: true as const }
  },

  async resetPassword(input: ResetPasswordInput) {
    const email = input.email.trim().toLowerCase()
    const now = new Date()

    const [record] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, input.token),
          gt(verificationTokens.expires, now)
        )
      )

    if (!record) {
      throw new AppError(
        "INVALID_TOKEN",
        "This reset link is invalid or has expired",
        400
      )
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (!user) {
      throw new AppError(
        "INVALID_TOKEN",
        "This reset link is invalid or has expired",
        400
      )
    }

    const passwordHash = await hash(input.password, 12)

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, input.token)
        )
      )

    return { reset: true as const }
  },
}
