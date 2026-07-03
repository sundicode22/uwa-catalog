import { eq } from "drizzle-orm"
import { db, orders, stores } from "@/lib/db"
import { storeTransactionService } from "@/server/services/store-transaction.service"
import { walletService } from "@/server/services/wallet.service"

export const paymentSettlementService = {
  async settleOrderPayment(input: {
    orderId: string
    reference?: string
    providerPayload?: Record<string, unknown>
  }) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, input.orderId))

    if (!order) {
      return { success: false as const, reason: "order_not_found" as const }
    }

    if (order.paymentStatus === "paid") {
      const alreadyCredited = await walletService.hasOrderCredit(order.id)
      if (alreadyCredited) {
        return { success: true as const, alreadySettled: true as const }
      }
    }

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, order.storeId))

    if (!store) {
      return { success: false as const, reason: "store_not_found" as const }
    }

    await db
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: order.status === "pending" ? "confirmed" : order.status,
        paymentReference: input.reference ?? order.paymentReference,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))

    await storeTransactionService.syncStatusForOrder(order.id, "confirmed")

    const credit = await walletService.creditFromOrder({
      userId: store.ownerId,
      orderId: order.id,
      storeId: store.id,
      grossAmount: order.total,
      currency: store.currency ?? "USD",
    })

    return {
      success: true as const,
      alreadySettled: credit.alreadySettled ?? false,
      orderId: order.id,
      storeSlug: store.slug,
      trackingToken: order.trackingToken,
    }
  },
}
