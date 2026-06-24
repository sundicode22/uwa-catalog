import { success } from "@/server/lib/response"
import { serializeStore } from "@/server/lib/serializers"
import { storeService } from "@/server/services"
import { subscriptionService } from "@/server/services/subscription.service"
import { requireAuth } from "../plugins/auth"
import { forbidden } from "../plugins/errors"
import type { CreateStoreInput, UpdateStoreInput } from "@/types/domain"

export const storeController = {
  async list(userId: string | null) {
    const ownerId = requireAuth(userId)
    await subscriptionService.ensureForUser(ownerId)
    const stores = await storeService.listByOwner(ownerId)
    return success(stores.map(serializeStore))
  },

  async create(userId: string | null, body: CreateStoreInput) {
    const ownerId = requireAuth(userId)
    const store = await storeService.create(ownerId, body)
    return success(serializeStore(store))
  },

  async getBySlug(slug: string) {
    const store = await storeService.getBySlug(slug)
    return success({
      ...serializeStore(store),
      categories: store.categories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    })
  },

  async getById(userId: string | null, storeId: string) {
    const ownerId = requireAuth(userId)
    const store = await storeService.getById(storeId)
    if (store.ownerId !== ownerId) forbidden("Access denied")
    return success(serializeStore(store))
  },

  async update(
    userId: string | null,
    storeId: string,
    body: UpdateStoreInput
  ) {
    const ownerId = requireAuth(userId)
    const store = await storeService.update(storeId, ownerId, body)
    return success(serializeStore(store))
  },

  async getStats(userId: string | null, storeId: string) {
    const ownerId = requireAuth(userId)
    const stats = await storeService.getStats(storeId, ownerId)
    return success(stats)
  },
}
