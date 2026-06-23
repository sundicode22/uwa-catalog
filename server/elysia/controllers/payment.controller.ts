import { eq } from "drizzle-orm"
import { success } from "@/server/lib/response"
import { db, paymentProviderConfigs } from "@/lib/db"
import { storeService } from "@/server/services"
import { requireAuth } from "../plugins/auth"

export const paymentController = {
  async listByStore(userId: string | null, storeId: string) {
    const ownerId = requireAuth(userId)
    await storeService.assertOwner(storeId, ownerId)
    const configs = await db
      .select()
      .from(paymentProviderConfigs)
      .where(eq(paymentProviderConfigs.storeId, storeId))
    return success(
      configs.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }))
    )
  },
}
