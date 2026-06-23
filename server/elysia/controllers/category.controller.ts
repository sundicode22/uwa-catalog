import { success } from "@/server/lib/response"
import { serializeCategory } from "@/server/lib/serializers"
import { categoryService } from "@/server/services"
import { requireAuth } from "../plugins/auth"
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types/domain"

export const categoryController = {
  async listByStore(storeId: string) {
    const categories = await categoryService.listByStore(storeId)
    return success(categories.map(serializeCategory))
  },

  async create(userId: string | null, body: CreateCategoryInput) {
    const ownerId = requireAuth(userId)
    const category = await categoryService.create(ownerId, body)
    return success(serializeCategory(category))
  },

  async update(
    userId: string | null,
    id: string,
    body: UpdateCategoryInput
  ) {
    const ownerId = requireAuth(userId)
    const category = await categoryService.update(id, ownerId, body)
    return success(serializeCategory(category))
  },

  async delete(userId: string | null, id: string) {
    const ownerId = requireAuth(userId)
    const result = await categoryService.delete(id, ownerId)
    return success(result)
  },
}
