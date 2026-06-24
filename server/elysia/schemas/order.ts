import { t } from "elysia"
import { orderItemSchema } from "./product"

export const createOrderBody = t.Object({
  storeId: t.String(),
  customerName: t.String(),
  customerPhone: t.String(),
  customerEmail: t.Optional(t.String()),
  customerAddress: t.Optional(t.String()),
  customerCity: t.Optional(t.String()),
  customerRegion: t.Optional(t.String()),
  customerNotes: t.Optional(t.String()),
  items: t.Array(orderItemSchema),
  source: t.Optional(t.Union([t.Literal("whatsapp"), t.Literal("checkout")])),
})

export const updateOrderStatusBody = t.Object({
  status: t.Union([
    t.Literal("pending"),
    t.Literal("confirmed"),
    t.Literal("fulfilled"),
    t.Literal("cancelled"),
  ]),
})
