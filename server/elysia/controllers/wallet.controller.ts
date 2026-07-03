import { success } from "@/server/lib/response"
import { walletService } from "@/server/services/wallet.service"
import { withdrawalService } from "@/server/services/withdrawal.service"

export const walletController = {
  async getSummary(userId: string) {
    const summary = await walletService.getSummary(userId)
    return success(summary)
  },

  async listLedger(
    userId: string,
    query: { page?: number; limit?: number; currency?: string }
  ) {
    const result = await walletService.listLedger(userId, query)
    return success(result.items, result.meta)
  },

  async createWithdrawal(
    userId: string,
    body: {
      amount: string
      currency: string
      payoutMethod: string
      payoutDetails: {
        accountName?: string
        phone?: string
        operator?: string
        notes?: string
      }
    }
  ) {
    const request = await withdrawalService.createRequest(userId, body)
    return success({ withdrawal: request })
  },

  async listWithdrawals(
    userId: string,
    query: { page?: number; limit?: number }
  ) {
    const result = await withdrawalService.listForUser(userId, query)
    return success(result.items, result.meta)
  },
}
