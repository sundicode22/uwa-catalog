import type {
  CreateCategoryInput,
  CreateOrderInput,
  CreateProductInput,
  CreateStoreInput,
  CreateStoreCustomerInput,
  UpdateStoreCustomerInput,
  CustomerListQuery,
  StoreCustomer,
  StoreTransactionListItem,
  TransactionListQuery,
  DashboardStats,
  Order,
  Category,
  ProductOptionsPayload,
  Product,
  ProductListQuery,
  OrderListQuery,
  Store,
  StoreWithCategories,
  UpdateCategoryInput,
  UpdateOrderStatusInput,
  UpdateProductInput,
  UpdateStoreInput,
  UploadResult,
  PaymentProviderConfig,
  RegisterInput,
  RegisterResult,
  ForgotPasswordInput,
  ResetPasswordInput,
  BillingSummary,
  BillingPlansResponse,
  CheckoutSessionResult,
  NotchPayVerifyResult,
  AccountSubscriptionPlan,
  PlanDefinition,
} from "./domain"
import type { PaginationQuery, Paginated } from "./api"

export interface ApiEndpoints {
  "POST /auth/register": { body: RegisterInput; response: RegisterResult }
  "POST /auth/forgot-password": {
    body: ForgotPasswordInput
    response: { sent: true }
  }
  "POST /auth/reset-password": {
    body: ResetPasswordInput
    response: { reset: true }
  }

  "GET /health": { response: { status: string } }

  "GET /stores": { query?: PaginationQuery; response: Store[] }
  "POST /stores": { body: CreateStoreInput; response: Store }
  "GET /stores/:storeId": { params: { storeId: string }; response: Store }
  "PATCH /stores/:storeId": {
    params: { storeId: string }
    body: UpdateStoreInput
    response: Store
  }
  "GET /stores/slug/:slug": {
    params: { slug: string }
    response: StoreWithCategories
  }
  "GET /stores/:storeId/stats": {
    params: { storeId: string }
    response: DashboardStats
  }

  "GET /stores/:storeId/categories": {
    params: { storeId: string }
    response: Category[]
  }
  "POST /categories": { body: CreateCategoryInput; response: Category }
  "PATCH /categories/:id": {
    params: { id: string }
    body: UpdateCategoryInput
    response: Category
  }
  "DELETE /categories/:id": { params: { id: string }; response: { id: string } }

  "GET /stores/:storeId/products": {
    params: { storeId: string }
    query?: ProductListQuery
    response: Paginated<Product>
  }
  "GET /products/:id": { params: { id: string }; response: Product }
  "GET /products/:id/options": {
    params: { id: string }
    response: ProductOptionsPayload
  }
  "GET /stores/:storeId/products/slug/:slug": {
    params: { storeId: string; slug: string }
    response: Product
  }
  "POST /products": { body: CreateProductInput; response: Product }
  "PATCH /products/:id": {
    params: { id: string }
    body: UpdateProductInput
    response: Product
  }
  "DELETE /products/:id": { params: { id: string }; response: { id: string } }

  "GET /stores/:storeId/orders": {
    params: { storeId: string }
    query?: OrderListQuery
    response: Paginated<Order>
  }
  "POST /orders": { body: CreateOrderInput; response: Order }
  "PATCH /orders/:id/status": {
    params: { id: string }
    body: UpdateOrderStatusInput
    response: Order
  }

  "GET /stores/:storeId/customers": {
    params: { storeId: string }
    query?: CustomerListQuery
    response: Paginated<StoreCustomer>
  }
  "GET /customers/:customerId": {
    params: { customerId: string }
    response: StoreCustomer
  }
  "POST /customers": {
    body: CreateStoreCustomerInput
    response: StoreCustomer
  }
  "PATCH /customers/:customerId": {
    params: { customerId: string }
    body: UpdateStoreCustomerInput
    response: StoreCustomer
  }

  "GET /stores/:storeId/transactions": {
    params: { storeId: string }
    query?: TransactionListQuery
    response: Paginated<StoreTransactionListItem>
  }

  "POST /uploads": {
    response: UploadResult
  }

  "GET /stores/:storeId/payment-providers": {
    params: { storeId: string }
    response: PaymentProviderConfig[]
  }

  "GET /billing/plans": { response: BillingPlansResponse }
  "GET /billing": { response: BillingSummary }
  "GET /billing/admin/plans": { response: BillingPlansResponse }
  "PATCH /billing/admin/plans/:planId": {
    params: { planId: AccountSubscriptionPlan }
    body: {
      name?: string
      description?: string
      monthlyPriceUsd?: number
      monthlyPriceXaf?: number
      maxStores?: number
      maxProductsPerStore?: number
      features?: string[]
      sortOrder?: number
      isPopular?: boolean
      isActive?: boolean
    }
    response: { plan: PlanDefinition }
  }
  "POST /billing/stripe/checkout": {
    body: { plan: Exclude<AccountSubscriptionPlan, "free"> }
    response: CheckoutSessionResult
  }
  "POST /billing/stripe/portal": { response: CheckoutSessionResult }
  "POST /billing/notchpay/checkout": {
    body: { plan: Exclude<AccountSubscriptionPlan, "free"> }
    response: CheckoutSessionResult
  }
  "POST /billing/notchpay/verify": {
    body: { reference: string }
    response: NotchPayVerifyResult
  }
}

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

export type EndpointKey = keyof ApiEndpoints

export type EndpointParams<K extends EndpointKey> = ApiEndpoints[K] extends {
  params: infer P
}
  ? P
  : never

export type EndpointQuery<K extends EndpointKey> = ApiEndpoints[K] extends {
  query?: infer Q
}
  ? Q
  : never

export type EndpointBody<K extends EndpointKey> = ApiEndpoints[K] extends {
  body?: infer B
}
  ? B
  : never

export type EndpointResponse<K extends EndpointKey> =
  ApiEndpoints[K] extends { response: infer R } ? R : never
