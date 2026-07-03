import { success } from "@/server/lib/response"
import { platformAdminService } from "@/server/services/platform-admin.service"
import { withdrawalService } from "@/server/services/withdrawal.service"
import { requirePlatformAdmin } from "@/server/elysia/plugins/platform-admin"
import type { WithdrawalStatus } from "@/types/domain"

export const adminController = {
  async getOverview(userEmail: string | null | undefined) {
    requirePlatformAdmin(userEmail)
    const metrics = await platformAdminService.getOverviewMetrics()
    return success(metrics)
  },

  async listWithdrawals(
    userEmail: string | null | undefined,
    query: { page?: number; limit?: number; status?: WithdrawalStatus; search?: string }
  ) {
    requirePlatformAdmin(userEmail)
    const result = await withdrawalService.listForAdmin(query)
    return success(result.items, result.meta)
  },

  async updateWithdrawal(
    userEmail: string | null | undefined,
    adminUserId: string,
    id: string,
    action: "approve" | "reject" | "mark_paid",
    note?: string
  ) {
    requirePlatformAdmin(userEmail)

    if (action === "approve") {
      const withdrawal = await withdrawalService.approve(id, adminUserId)
      return success({ withdrawal })
    }
    if (action === "reject") {
      const withdrawal = await withdrawalService.reject(id, adminUserId, note)
      return success({ withdrawal })
    }
    const withdrawal = await withdrawalService.markPaid(id, adminUserId, note)
    return success({ withdrawal })
  },

  async listUsers(
    userEmail: string | null | undefined,
    query: { page?: number; limit?: number; search?: string }
  ) {
    requirePlatformAdmin(userEmail)
    const result = await platformAdminService.listUsers(query)
    return success(result.items, result.meta)
  },

  async listStores(
    userEmail: string | null | undefined,
    query: { page?: number; limit?: number; search?: string }
  ) {
    requirePlatformAdmin(userEmail)
    const result = await platformAdminService.listStores(query)
    return success(result.items, result.meta)
  },

  async getVisitors(
    userEmail: string | null | undefined,
    query: { storeId?: string; days?: number }
  ) {
    requirePlatformAdmin(userEmail)
    const metrics = await platformAdminService.getVisitorMetrics(query)
    return success(metrics)
  },

  async getSettings(userEmail: string | null | undefined) {
    requirePlatformAdmin(userEmail)
    const settings = await platformAdminService.getSettings()
    return success({ settings })
  },

  async updateSettings(
    userEmail: string | null | undefined,
    body: { platformFeePercent?: number; minWithdrawalAmount?: number }
  ) {
    requirePlatformAdmin(userEmail)
    const settings = await platformAdminService.updateSettings(body)
    return success({ settings })
  },
}
