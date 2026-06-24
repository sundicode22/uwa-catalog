import { success } from "@/server/lib/response"
import { serializeStoreCustomer } from "@/server/lib/serializers"
import { customerService } from "@/server/services/customer.service"
import { requireAuth } from "../plugins/auth"
import type {
  CreateStoreCustomerInput,
  CustomerListQuery,
  UpdateStoreCustomerInput,
} from "@/types/domain"

export const customerController = {
  async list(
    userId: string | null,
    storeId: string,
    query: CustomerListQuery
  ) {
    const ownerId = requireAuth(userId)
    const result = await customerService.list(storeId, ownerId, query)
    return success(
      result.items.map(serializeStoreCustomer),
      result.meta
    )
  },

  async getById(userId: string | null, customerId: string) {
    const ownerId = requireAuth(userId)
    const customer = await customerService.getById(customerId, ownerId)
    return success(serializeStoreCustomer(customer))
  },

  async create(userId: string | null, body: CreateStoreCustomerInput) {
    const ownerId = requireAuth(userId)
    const customer = await customerService.create(ownerId, body)
    return success(serializeStoreCustomer(customer))
  },

  async update(
    userId: string | null,
    customerId: string,
    body: UpdateStoreCustomerInput
  ) {
    const ownerId = requireAuth(userId)
    const customer = await customerService.update(customerId, ownerId, body)
    return success(serializeStoreCustomer(customer))
  },
}
