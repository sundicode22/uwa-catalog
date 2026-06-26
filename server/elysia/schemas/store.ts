import { t } from "elysia"

export const createStoreBody = t.Object({
  name: t.String(),
  description: t.Optional(t.String()),
  whatsappNumber: t.Optional(t.String()),
})

export const updateStoreBody = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  logoUrl: t.Optional(t.Nullable(t.String())),
  coverImageUrl: t.Optional(t.Nullable(t.String())),
  whatsappNumber: t.Optional(t.String()),
  orderMode: t.Optional(t.Union([t.Literal("whatsapp"), t.Literal("managed")])),
  catalogLayout: t.Optional(
    t.Union([
      t.Literal("grid-2"),
      t.Literal("grid-3"),
      t.Literal("grid-4"),
      t.Literal("list"),
      t.Literal("masonry"),
    ])
  ),
  isPublished: t.Optional(t.Boolean()),
  currency: t.Optional(t.String()),
  storefrontTier: t.Optional(
    t.Union([t.Literal("basic"), t.Literal("premium")])
  ),
  pickupEnabled: t.Optional(t.Boolean()),
  deliveryEnabled: t.Optional(t.Boolean()),
  deliveryFee: t.Optional(t.String()),
  freeDeliveryMinimum: t.Optional(t.Nullable(t.String())),
  lowStockThreshold: t.Optional(t.Number()),
  notifyOnNewOrder: t.Optional(t.Boolean()),
  storefrontPaymentsEnabled: t.Optional(t.Boolean()),
})
