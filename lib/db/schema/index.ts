import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

export const orderModeEnum = pgEnum("order_mode", ["whatsapp", "managed"])
export const catalogLayoutEnum = pgEnum("catalog_layout", [
  "grid-2",
  "grid-3",
  "grid-4",
  "list",
  "masonry",
])
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "fulfilled",
  "cancelled",
])
export const orderSourceEnum = pgEnum("order_source", ["whatsapp", "checkout"])
export const fulfillmentTypeEnum = pgEnum("fulfillment_type", ["pickup", "delivery"])
export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "not_required",
  "unpaid",
  "paid",
])
export const discountTypeEnum = pgEnum("discount_type", ["percent", "fixed"])
export const storeTransactionTypeEnum = pgEnum("store_transaction_type", [
  "sale",
  "refund",
])
export const storeTransactionStatusEnum = pgEnum("store_transaction_status", [
  "pending",
  "completed",
  "voided",
])
export const storefrontTierEnum = pgEnum("storefront_tier", ["basic", "premium"])
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "basic", "premium"])
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
])
export const billingProviderEnum = pgEnum("billing_provider", [
  "none",
  "stripe",
  "notchpay",
])
export const billingTransactionStatusEnum = pgEnum("billing_transaction_status", [
  "pending",
  "processing",
  "complete",
  "failed",
  "canceled",
  "expired",
])
export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "paystack",
  "flutterwave",
  "razorpay",
  "mercado_pago",
])

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const userSubscriptions = pgTable("user_subscriptions", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: subscriptionPlanEnum("plan").default("free").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  provider: billingProviderEnum("provider").default("none").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  notchpayCustomerRef: text("notchpay_customer_ref"),
  currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const billingCustomers = pgTable(
  "billing_customers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: billingProviderEnum("provider").notNull(),
    externalCustomerId: text("external_customer_id"),
    externalReference: text("external_reference"),
    email: text("email"),
    name: text("name"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("billing_customers_user_provider_idx").on(
      table.userId,
      table.provider
    ),
    index("billing_customers_provider_ref_idx").on(
      table.provider,
      table.externalReference
    ),
  ]
)

export const billingPlanDefinitions = pgTable("billing_plan_definitions", {
  id: subscriptionPlanEnum("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  monthlyPriceUsd: integer("monthly_price_usd").notNull(),
  monthlyPriceXaf: integer("monthly_price_xaf").notNull(),
  maxStores: integer("max_stores").notNull(),
  maxProductsPerStore: integer("max_products_per_store").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isPopular: boolean("is_popular").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const billingTransactions = pgTable(
  "billing_transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: billingProviderEnum("provider").notNull(),
    plan: subscriptionPlanEnum("plan").notNull(),
    status: billingTransactionStatusEnum("status").default("pending").notNull(),
    currency: text("currency").notNull(),
    amount: integer("amount").notNull(),
    externalTransactionId: text("external_transaction_id"),
    externalCustomerId: text("external_customer_id"),
    externalReference: text("external_reference").notNull(),
    checkoutUrl: text("checkout_url"),
    paymentMethod: text("payment_method"),
    paidAt: timestamp("paid_at", { mode: "date" }),
    lastPayload: jsonb("last_payload"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("billing_transactions_reference_idx").on(table.externalReference),
    uniqueIndex("billing_transactions_provider_transaction_idx").on(
      table.provider,
      table.externalTransactionId
    ),
    index("billing_transactions_user_idx").on(table.userId),
  ]
)

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
)

export const stores = pgTable(
  "stores",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),
    whatsappNumber: text("whatsapp_number"),
    orderMode: orderModeEnum("order_mode").default("whatsapp").notNull(),
    catalogLayout: catalogLayoutEnum("catalog_layout")
      .default("grid-3")
      .notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    currency: text("currency").default("USD").notNull(),
    storefrontTier: storefrontTierEnum("storefront_tier")
      .default("basic")
      .notNull(),
    pickupEnabled: boolean("pickup_enabled").default(true).notNull(),
    deliveryEnabled: boolean("delivery_enabled").default(false).notNull(),
    deliveryFee: text("delivery_fee").default("0").notNull(),
    freeDeliveryMinimum: text("free_delivery_minimum"),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    notifyOnNewOrder: boolean("notify_on_new_order").default(true).notNull(),
    storefrontPaymentsEnabled: boolean("storefront_payments_enabled")
      .default(false)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("stores_slug_idx").on(table.slug),
    index("stores_owner_idx").on(table.ownerId),
  ]
)

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("categories_store_slug_idx").on(table.storeId, table.slug),
    index("categories_store_idx").on(table.storeId),
  ]
)

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    price: text("price").notNull(),
    currency: text("currency").default("USD").notNull(),
    images: jsonb("images").$type<{ url: string; publicId: string }[]>().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    inventory: integer("inventory"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_store_slug_idx").on(table.storeId, table.slug),
    index("products_store_idx").on(table.storeId),
    index("products_category_idx").on(table.categoryId),
  ]
)

export const productSizes = pgTable(
  "product_sizes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceAdjustment: text("price_adjustment").default("0").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("product_sizes_product_idx").on(table.productId)]
)

export const productVariationGroups = pgTable(
  "product_variation_groups",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    required: boolean("required").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("product_variation_groups_product_idx").on(table.productId)]
)

export const productVariationOptions = pgTable(
  "product_variation_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    groupId: text("group_id")
      .notNull()
      .references(() => productVariationGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceAdjustment: text("price_adjustment").default("0").notNull(),
    image: jsonb("image").$type<{ url: string; publicId: string } | null>(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("product_variation_options_group_idx").on(table.groupId)]
)

export const productModifierGroups = pgTable(
  "product_modifier_groups",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    required: boolean("required").default(false).notNull(),
    minSelections: integer("min_selections").default(0).notNull(),
    maxSelections: integer("max_selections").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("product_modifier_groups_product_idx").on(table.productId)]
)

export const productModifierOptions = pgTable(
  "product_modifier_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    groupId: text("group_id")
      .notNull()
      .references(() => productModifierGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceAdjustment: text("price_adjustment").default("0").notNull(),
    image: jsonb("image").$type<{ url: string; publicId: string } | null>(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("product_modifier_options_group_idx").on(table.groupId)]
)

export const storeCustomers = pgTable(
  "store_customers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    phoneNormalized: text("phone_normalized").notNull(),
    email: text("email"),
    address: text("address"),
    city: text("city"),
    region: text("region"),
    notes: text("notes"),
    totalOrders: integer("total_orders").default(0).notNull(),
    totalSpent: text("total_spent").default("0").notNull(),
    lastOrderAt: timestamp("last_order_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("store_customers_store_phone_idx").on(
      table.storeId,
      table.phoneNormalized
    ),
    index("store_customers_store_idx").on(table.storeId),
  ]
)

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    customerId: text("customer_id").references(() => storeCustomers.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    total: text("total").notNull(),
    subtotal: text("subtotal"),
    deliveryFee: text("delivery_fee").default("0").notNull(),
    discountCode: text("discount_code"),
    discountAmount: text("discount_amount").default("0").notNull(),
    fulfillmentType: fulfillmentTypeEnum("fulfillment_type")
      .default("pickup")
      .notNull(),
    paymentStatus: orderPaymentStatusEnum("payment_status")
      .default("not_required")
      .notNull(),
    paymentReference: text("payment_reference"),
    trackingToken: text("tracking_token"),
    status: orderStatusEnum("status").default("pending").notNull(),
    source: orderSourceEnum("source").default("whatsapp").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_store_idx").on(table.storeId),
    index("orders_customer_idx").on(table.customerId),
    uniqueIndex("orders_tracking_token_idx").on(table.trackingToken),
  ]
)

export const storeDiscountCodes = pgTable(
  "store_discount_codes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    type: discountTypeEnum("type").notNull(),
    value: text("value").notNull(),
    minOrderTotal: text("min_order_total"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").default(0).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("store_discount_codes_store_code_idx").on(table.storeId, table.code),
    index("store_discount_codes_store_idx").on(table.storeId),
  ]
)

export const storeTransactions = pgTable(
  "store_transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => storeCustomers.id, { onDelete: "cascade" }),
    type: storeTransactionTypeEnum("type").default("sale").notNull(),
    status: storeTransactionStatusEnum("status").default("pending").notNull(),
    amount: text("amount").notNull(),
    currency: text("currency").notNull(),
    paymentMethod: text("payment_method"),
    reference: text("reference"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("store_transactions_order_idx").on(table.orderId),
    index("store_transactions_store_idx").on(table.storeId),
    index("store_transactions_customer_idx").on(table.customerId),
  ]
)

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    price: text("price").notNull(),
    quantity: integer("quantity").notNull(),
    selections: jsonb("selections")
      .$type<{
        size?: {
          sizeId: string
          sizeName: string
          priceAdjustment: string
        } | null
        variations: {
          groupId: string
          groupName: string
          optionId: string
          optionName: string 
          priceAdjustment: string
        }[]
        modifiers: {
          groupId: string
          groupName: string
          optionId: string
          optionName: string
          priceAdjustment: string
        }[]
      }>()
      .default({ size: null, variations: [], modifiers: [] })
      .notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)]
)

export const paymentProviderConfigs = pgTable(
  "payment_provider_configs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    region: text("region").notNull(),
    encryptedConfig: jsonb("encrypted_config").$type<Record<string, string>>().default({}).notNull(),
    isEnabled: boolean("is_enabled").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("payment_provider_store_provider_idx").on(
      table.storeId,
      table.provider
    ),
    index("payment_provider_store_idx").on(table.storeId),
  ]
)
