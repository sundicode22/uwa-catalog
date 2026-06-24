export type OrderMode = "whatsapp" | "managed"
export type CatalogLayout = "grid-2" | "grid-3" | "grid-4" | "list" | "masonry"
export type OrderStatus = "pending" | "confirmed" | "fulfilled" | "cancelled"
export type OrderSource = "whatsapp" | "checkout"
export type PaymentProvider = "stripe" | "paystack" | "flutterwave" | "razorpay" | "mercado_pago"
export type StorefrontTier = "basic" | "premium"

export interface ProductImage {
  url: string
  publicId: string
}

export interface ProductSize {
  id: string
  productId?: string
  name: string
  priceAdjustment: string
  sortOrder?: number
  isActive?: boolean
}

export interface SelectedSize {
  sizeId: string
  sizeName: string
  priceAdjustment: string
}

export interface ProductOptionCounts {
  sizes: number
  variationGroups: number
  modifierGroups: number
}

export interface ProductOptionsPayload {
  sizes: ProductSize[]
  variations: ProductVariationGroup[]
  modifiers: ProductModifierGroup[]
}

export interface ProductOption {
  id: string
  name: string
  priceAdjustment: string
  image?: ProductImage | null
}

export interface ProductVariationGroup {
  id: string
  name: string
  required: boolean
  options: ProductOption[]
}

export interface ProductModifierGroup {
  id: string
  name: string
  required: boolean
  minSelections: number
  maxSelections: number
  options: ProductOption[]
}

export interface SelectedVariation {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceAdjustment: string
}

export interface SelectedModifier {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceAdjustment: string
}

export interface ProductSelections {
  size?: SelectedSize | null
  variations: SelectedVariation[]
  modifiers: SelectedModifier[]
}

export interface Store {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  whatsappNumber: string | null
  orderMode: OrderMode
  catalogLayout: CatalogLayout
  isPublished: boolean
  currency: string
  storefrontTier: StorefrontTier
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  storeId: string
  name: string
  slug: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  storeId: string
  categoryId: string | null
  name: string
  slug: string
  description: string | null
  price: string
  currency: string
  images: ProductImage[]
  optionCounts?: ProductOptionCounts
  isActive: boolean
  isFeatured: boolean
  inventory: number | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  category?: Category | null
}

export interface OrderItem {
  productId: string
  name: string
  price: string
  quantity: number
  displayName?: string
  selections?: ProductSelections
  inventory?: number | null
}

export interface Order {
  id: string
  storeId: string
  customerId: string | null
  customerName: string
  customerPhone: string
  items: OrderItem[]
  total: string
  status: OrderStatus
  source: OrderSource
  createdAt: string
  updatedAt: string
}

export type StoreTransactionType = "sale" | "refund"
export type StoreTransactionStatus = "pending" | "completed" | "voided"

export interface StoreCustomer {
  id: string
  storeId: string
  name: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  region: string | null
  notes: string | null
  totalOrders: number
  totalSpent: string
  lastOrderAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StoreTransaction {
  id: string
  storeId: string
  orderId: string
  customerId: string
  type: StoreTransactionType
  status: StoreTransactionStatus
  amount: string
  currency: string
  paymentMethod: string | null
  reference: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface StoreTransactionListItem extends StoreTransaction {
  customerName: string
  customerPhone: string
}

export interface TransactionListQuery {
  page?: number
  limit?: number
  search?: string
  status?: StoreTransactionStatus
}

export interface CustomerListQuery {
  page?: number
  limit?: number
  search?: string
}

export interface CreateStoreCustomerInput {
  storeId: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  region?: string
  notes?: string
}

export interface UpdateStoreCustomerInput {
  name?: string
  phone?: string
  email?: string | null
  address?: string | null
  city?: string | null
  region?: string | null
  notes?: string | null
}

export interface UpsertStoreCustomerInput {
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  region?: string
  notes?: string
  orderTotal: string
}

export interface StoreWithCategories extends Store {
  categories: Category[]
}

export interface CreateStoreInput {
  name: string
  description?: string
  whatsappNumber?: string
}

export interface UpdateStoreInput {
  name?: string
  description?: string
  logoUrl?: string | null
  coverImageUrl?: string | null
  whatsappNumber?: string
  orderMode?: OrderMode
  catalogLayout?: CatalogLayout
  isPublished?: boolean
  currency?: string
  storefrontTier?: StorefrontTier
}

export interface CreateCategoryInput {
  storeId: string
  name: string
}

export interface UpdateCategoryInput {
  name?: string
  sortOrder?: number
}

export interface CreateProductInput {
  storeId: string
  categoryId?: string
  name: string
  description?: string
  price: string
  currency?: string
  images?: ProductImage[]
  sizes?: ProductSize[]
  variations?: ProductVariationGroup[]
  modifiers?: ProductModifierGroup[]
  isActive?: boolean
  isFeatured?: boolean
  inventory?: number | null
}

export interface UpdateProductInput {
  categoryId?: string | null
  name?: string
  description?: string
  price?: string
  currency?: string
  images?: ProductImage[]
  sizes?: ProductSize[]
  variations?: ProductVariationGroup[]
  modifiers?: ProductModifierGroup[]
  isActive?: boolean
  isFeatured?: boolean
  inventory?: number | null
  sortOrder?: number
}

export interface ProductListQuery {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  isActive?: boolean
  isFeatured?: boolean
  inventory?: number | null
}

export interface OrderListQuery {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
}

export interface CreateOrderInput {
  storeId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  customerCity?: string
  customerRegion?: string
  customerNotes?: string
  items: OrderItem[]
  source?: OrderSource
}

export interface UpdateOrderStatusInput {
  status: OrderStatus
}

export interface UploadResult {
  url: string
  publicId: string
}

export interface DashboardOrdersTrendPoint {
  date: string
  label: string
  orders: number
  revenue: string
}

export interface DashboardOrderStatusPoint {
  status: OrderStatus
  count: number
}

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalCategories: number
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  fulfilledOrders: number
  cancelledOrders: number
  ordersThisWeek: number
  totalRevenue: string
  ordersTrend: DashboardOrdersTrendPoint[]
  orderStatusBreakdown: DashboardOrderStatusPoint[]
}

export interface PaymentProviderConfig {
  id: string
  storeId: string
  provider: PaymentProvider
  region: string
  isEnabled: boolean
  createdAt: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface RegisterResult {
  id: string
  email: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  email: string
  token: string
  password: string
}

export type AccountSubscriptionPlan = "free" | "basic" | "premium"
export type AccountSubscriptionStatus = "active" | "past_due" | "canceled"
export type AccountBillingProvider = "none" | "stripe" | "notchpay"

export interface PlanDefinition {
  id: AccountSubscriptionPlan
  name: string
  description: string
  monthlyPriceUsd: number
  monthlyPriceXaf: number
  maxStores: number
  maxProductsPerStore: number
  features: string[]
  sortOrder?: number
  isPopular?: boolean
  isActive?: boolean
}

export interface UserSubscription {
  userId: string
  plan: AccountSubscriptionPlan
  status: AccountSubscriptionStatus
  provider: AccountBillingProvider
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  notchpayCustomerRef: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface BillingUsage {
  storeCount: number
  productsByStore: Record<string, number>
}

export interface BillingLimits {
  maxStores: number
  maxProductsPerStore: number
}

export interface BillingSummary {
  subscription: UserSubscription
  usage: BillingUsage
  plans: PlanDefinition[]
  limits: BillingLimits
  canManagePlans?: boolean
}

export interface BillingPlansResponse {
  plans: PlanDefinition[]
}

export interface CheckoutSessionResult {
  url?: string
  paymentId?: string | null
  reference?: string
}

export interface NotchPayVerifyResult {
  status: "pending" | "processing" | "complete" | "failed" | "canceled" | "expired"
  reference: string
  plan: AccountSubscriptionPlan
  authorizationUrl?: string | null
}
