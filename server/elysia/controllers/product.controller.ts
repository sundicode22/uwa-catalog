import { success } from "@/server/lib/response"
import { serializeProductSummary } from "@/server/lib/serializers"
import { productService } from "@/server/services"
import { productOptionsService } from "@/server/services/product-options.service"
import { requireAuth } from "../plugins/auth"
import type {
  CreateProductInput,
  ProductListQuery,
  UpdateProductInput,
} from "@/types/domain"

export const productController = {
  async list(storeId: string, query: ProductListQuery) {
    const result = await productService.list(storeId, query)
    return success(result.items, result.meta)
  },

  async getById(id: string) {
    const product = await productService.getById(id)
    const counts = await productOptionsService.getCounts([id])
    return success(serializeProductSummary(product, counts[id]))
  },

  async getOptions(id: string) {
    const options = await productService.getOptions(id)
    return success(options)
  },

  async getBySlug(storeId: string, slug: string) {
    const product = await productService.getBySlug(storeId, slug)
    const counts = await productOptionsService.getCounts([product.id])
    return success(serializeProductSummary(product, counts[product.id]))
  },

  async create(userId: string | null, body: CreateProductInput) {
    const ownerId = requireAuth(userId)
    const product = await productService.create(ownerId, body)
    const counts = await productOptionsService.getCounts([product.id])
    return success(serializeProductSummary(product, counts[product.id]))
  },

  async update(
    userId: string | null,
    id: string,
    body: UpdateProductInput
  ) {
    const ownerId = requireAuth(userId)
    const product = await productService.update(id, ownerId, body)
    const counts = await productOptionsService.getCounts([product.id])
    return success(serializeProductSummary(product, counts[product.id]))
  },

  async delete(userId: string | null, id: string) {
    const ownerId = requireAuth(userId)
    const result = await productService.delete(id, ownerId)
    return success(result)
  },
}
