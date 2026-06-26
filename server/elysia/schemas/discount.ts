import { t } from "elysia"

export const createDiscountCodeBody = t.Object({
  storeId: t.String(),
  code: t.String(),
  type: t.Union([t.Literal("percent"), t.Literal("fixed")]),
  value: t.String(),
  minOrderTotal: t.Optional(t.String()),
  maxUses: t.Optional(t.Number()),
  expiresAt: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
})

export const updateDiscountCodeBody = t.Object({
  code: t.Optional(t.String()),
  type: t.Optional(t.Union([t.Literal("percent"), t.Literal("fixed")])),
  value: t.Optional(t.String()),
  minOrderTotal: t.Optional(t.Nullable(t.String())),
  maxUses: t.Optional(t.Nullable(t.Number())),
  expiresAt: t.Optional(t.Nullable(t.String())),
  isActive: t.Optional(t.Boolean()),
})

export const validateDiscountBody = t.Object({
  storeId: t.String(),
  code: t.String(),
  subtotal: t.String(),
})
