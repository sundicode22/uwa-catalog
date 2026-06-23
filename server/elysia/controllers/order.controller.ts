import { success } from "@/server/lib/response"
import { orderService } from "@/server/services"
import { requireAuth } from "../plugins/auth"
import type { CreateOrderInput, OrderListQuery, UpdateOrderStatusInput } from "@/types/domain"

export const orderController = {
  async list(
    userId: string | null,
    storeId: string,
    query: OrderListQuery = {}
  ) {
    const ownerId = requireAuth(userId)
    const result = await orderService.list(storeId, ownerId, query)
    return success(result.items, result.meta)
  },

  async create(body: CreateOrderInput) {
    const order = await orderService.create(body)
    return success(order)
  },

  async updateStatus(
    userId: string | null,
    id: string,
    body: UpdateOrderStatusInput
  ) {
    const ownerId = requireAuth(userId)
    const order = await orderService.updateStatus(id, ownerId, body)
    return success(order)
  },
}
