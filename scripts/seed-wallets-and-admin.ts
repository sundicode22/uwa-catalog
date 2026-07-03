import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { db, users } from "@/lib/db"
import { subscriptionService } from "@/server/services/subscription.service"
import { walletService } from "@/server/services/wallet.service"

const DEFAULT_ADMIN_NAME = "Platform Admin"

async function ensureAdminUser(input: {
  email: string
  password: string
  name?: string
}) {
  const email = input.email.trim().toLowerCase()
  const passwordHash = await hash(input.password, 12)
  const name = input.name?.trim() || DEFAULT_ADMIN_NAME

  const [existing] = await db.select().from(users).where(eq(users.email, email))

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        name: existing.name ?? name,
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning()

    await subscriptionService.ensureForUser(updated.id)
    await walletService.ensureForUser(updated.id)
    return { user: updated, created: false }
  }

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
    })
    .returning()

  await subscriptionService.ensureForUser(created.id)
  await walletService.ensureForUser(created.id)
  return { user: created, created: true }
}

async function main() {
  const walletResult = await walletService.ensureForAllUsers()
  console.log(
    `Wallet backfill complete: ${walletResult.users} users checked, ${walletResult.walletsCreated} new wallet account(s) created.`
  )

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const { user, created } = await ensureAdminUser({
      email: adminEmail,
      password: adminPassword,
      name: process.env.ADMIN_NAME,
    })
    console.log(
      `${created ? "Created" : "Updated"} admin user: ${user.email} (${user.id})`
    )
  } else {
    console.log(
      "Skipped admin user setup (set ADMIN_EMAIL and ADMIN_PASSWORD to create/update the platform admin account)."
    )
  }

  const platformAdmins = process.env.PLATFORM_ADMIN_EMAILS?.trim()
  if (platformAdmins) {
    console.log(`PLATFORM_ADMIN_EMAILS is configured: ${platformAdmins}`)
  } else {
    console.warn(
      "PLATFORM_ADMIN_EMAILS is not set. Add the admin email to .env so /admin access works."
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
