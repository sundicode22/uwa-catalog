import { t } from "elysia"

export const createStoreCustomerBody = t.Object({
  storeId: t.String(),
  name: t.String(),
  phone: t.String(),
  email: t.Optional(t.String()),
  address: t.Optional(t.String()),
  city: t.Optional(t.String()),
  region: t.Optional(t.String()),
  notes: t.Optional(t.String()),
})

export const updateStoreCustomerBody = t.Object({
  name: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  email: t.Optional(t.Nullable(t.String())),
  address: t.Optional(t.Nullable(t.String())),
  city: t.Optional(t.Nullable(t.String())),
  region: t.Optional(t.Nullable(t.String())),
  notes: t.Optional(t.Nullable(t.String())),
})
