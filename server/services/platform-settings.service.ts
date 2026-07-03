import { eq } from "drizzle-orm"
import { db, platformSettings } from "@/lib/db"

const PLATFORM_FEE_KEY = "platform_fee_percent"
const MIN_WITHDRAWAL_KEY = "min_withdrawal_amount"

export type PlatformSettingsValues = {
  platformFeePercent: number
  minWithdrawalAmount: number
}

const DEFAULTS: PlatformSettingsValues = {
  platformFeePercent: 5,
  minWithdrawalAmount: 1000,
}

async function getSetting(key: string): Promise<Record<string, unknown> | null> {
  const [row] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
  return (row?.value as Record<string, unknown> | undefined) ?? null
}

async function upsertSetting(key: string, value: Record<string, unknown>) {
  const [existing] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key))

  if (existing) {
    await db
      .update(platformSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(platformSettings.key, key))
    return
  }

  await db.insert(platformSettings).values({ key, value })
}

export const platformSettingsService = {
  async getSettings(): Promise<PlatformSettingsValues> {
    const [feeRow, minRow] = await Promise.all([
      getSetting(PLATFORM_FEE_KEY),
      getSetting(MIN_WITHDRAWAL_KEY),
    ])

    const feeValue = feeRow?.value
    const minValue = minRow?.value

    return {
      platformFeePercent:
        typeof feeValue === "number"
          ? feeValue
          : DEFAULTS.platformFeePercent,
      minWithdrawalAmount:
        typeof minValue === "number"
          ? minValue
          : DEFAULTS.minWithdrawalAmount,
    }
  },

  async getPlatformFeePercent(): Promise<number> {
    const settings = await this.getSettings()
    return settings.platformFeePercent
  },

  async updateSettings(input: Partial<PlatformSettingsValues>) {
    if (input.platformFeePercent !== undefined) {
      const value = Math.min(100, Math.max(0, input.platformFeePercent))
      await upsertSetting(PLATFORM_FEE_KEY, { value })
    }
    if (input.minWithdrawalAmount !== undefined) {
      const value = Math.max(0, input.minWithdrawalAmount)
      await upsertSetting(MIN_WITHDRAWAL_KEY, { value })
    }
    return this.getSettings()
  },
}
