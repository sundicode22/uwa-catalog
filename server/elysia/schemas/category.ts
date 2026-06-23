import { t } from "elysia"

export const createCategoryBody = t.Object({
  storeId: t.String(),
  name: t.String(),
})

export const updateCategoryBody = t.Object({
  name: t.Optional(t.String()),
  sortOrder: t.Optional(t.Number()),
})
