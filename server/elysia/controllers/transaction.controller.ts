import { success } from "@/server/lib/response"
import { serializeStoreTransaction } from "@/server/lib/serializers"
import { storeTransactionService } from "@/server/services/store-transaction.service"
import { requireAuth } from "../plugins/auth"
import type { TransactionListQuery } from "@/types/domain"

export const transactionController = {
  async list(
    userId: string | null,
    storeId: string,
    query: TransactionListQuery
  ) {
    const ownerId = requireAuth(userId)
    const result = await storeTransactionService.list(storeId, ownerId, query)
    return success(
      result.items.map((item) =>
        serializeStoreTransaction(item, {
          name: item.customerName,
          phone: item.customerPhone,
        })
      ),
      result.meta
    )
  },
}
