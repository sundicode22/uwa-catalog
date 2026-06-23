import { t } from "elysia"

export const imageSchema = t.Object({
  url: t.String(),
  publicId: t.String(),
})

export const optionSchema = t.Object({
  id: t.String(),
  name: t.String(),
  priceAdjustment: t.String(),
  image: t.Optional(t.Nullable(imageSchema)),
})

export const sizeSchema = t.Object({
  id: t.String(),
  name: t.String(),
  priceAdjustment: t.String(),
  sortOrder: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
})

export const variationGroupSchema = t.Object({
  id: t.String(),
  name: t.String(),
  required: t.Boolean(),
  options: t.Array(optionSchema),
})

export const modifierGroupSchema = t.Object({
  id: t.String(),
  name: t.String(),
  required: t.Boolean(),
  minSelections: t.Number(),
  maxSelections: t.Number(),
  options: t.Array(optionSchema),
})

export const selectionsSchema = t.Object({
  size: t.Optional(
    t.Nullable(
      t.Object({
        sizeId: t.String(),
        sizeName: t.String(),
        priceAdjustment: t.String(),
      })
    )
  ),
  variations: t.Array(
    t.Object({
      groupId: t.String(),
      groupName: t.String(),
      optionId: t.String(),
      optionName: t.String(),
      priceAdjustment: t.String(),
    })
  ),
  modifiers: t.Array(
    t.Object({
      groupId: t.String(),
      groupName: t.String(),
      optionId: t.String(),
      optionName: t.String(),
      priceAdjustment: t.String(),
    })
  ),
})

export const orderItemSchema = t.Object({
  productId: t.String(),
  name: t.String(),
  price: t.String(),
  quantity: t.Number(),
  displayName: t.Optional(t.String()),
  selections: t.Optional(selectionsSchema),
})

export const createProductBody = t.Object({
  storeId: t.String(),
  categoryId: t.Optional(t.String()),
  name: t.String(),
  description: t.Optional(t.String()),
  price: t.String(),
  currency: t.Optional(t.String()),
  images: t.Optional(t.Array(imageSchema)),
  sizes: t.Optional(t.Array(sizeSchema)),
  variations: t.Optional(t.Array(variationGroupSchema)),
  modifiers: t.Optional(t.Array(modifierGroupSchema)),
  isActive: t.Optional(t.Boolean()),
  isFeatured: t.Optional(t.Boolean()),
  inventory: t.Optional(t.Nullable(t.Integer())),
})

export const updateProductBody = t.Object({
  categoryId: t.Optional(t.Nullable(t.String())),
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  price: t.Optional(t.String()),
  currency: t.Optional(t.String()),
  images: t.Optional(t.Array(imageSchema)),
  sizes: t.Optional(t.Array(sizeSchema)),
  variations: t.Optional(t.Array(variationGroupSchema)),
  modifiers: t.Optional(t.Array(modifierGroupSchema)),
  isActive: t.Optional(t.Boolean()),
  isFeatured: t.Optional(t.Boolean()),
  inventory: t.Optional(t.Nullable(t.Integer())),
  sortOrder: t.Optional(t.Number()),
})
