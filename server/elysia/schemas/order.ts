import { t } from "elysia"
import { orderItemSchema } from "./product"

export const createOrderBody = t.Object({
  storeId: t.String(),
  customerName: t.String(),
  customerPhone: t.String(),
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
