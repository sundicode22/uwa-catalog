import { success } from "@/server/lib/response"
import { discountCodeService } from "@/server/services/discount-code.service"
import { requireAuth } from "../plugins/auth"
import type {
  CreateDiscountCodeInput,
  UpdateDiscountCodeInput,
} from "@/types/domain"

export const discountController = {
  async list(userId: string | null, storeId: string) {
    const ownerId = requireAuth(userId)
    const codes = await discountCodeService.list(storeId, ownerId)
    return success(codes)
  },

  async create(userId: string | null, body: CreateDiscountCodeInput) {
    const ownerId = requireAuth(userId)
    const code = await discountCodeService.create(ownerId, body)
    return success(code)
  },

  async update(
    userId: string | null,
    id: string,
    body: UpdateDiscountCodeInput
  ) {
    const ownerId = requireAuth(userId)
    const code = await discountCodeService.update(id, ownerId, body)
    return success(code)
  },

  async delete(userId: string | null, id: string) {
    const ownerId = requireAuth(userId)
    const result = await discountCodeService.delete(id, ownerId)
    return success(result)
  },

  async validate(body: {
    storeId: string
    code: string
    subtotal: string
  }) {
    const result = await discountCodeService.validate(
      body.storeId,
      body.code,
      parseFloat(body.subtotal)
    )
    return success(result)
  },
}
