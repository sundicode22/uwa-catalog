import { success } from "@/server/lib/response"
import { catalogAnalyticsService } from "@/server/services/catalog-analytics.service"

export const analyticsController = {
  async recordPageView(body: {
    storeSlug: string
    path: string
    visitorId: string
    referrer?: string
    userAgent?: string
  }) {
    const result = await catalogAnalyticsService.recordPageView(body)
    return success(result)
  },
}
