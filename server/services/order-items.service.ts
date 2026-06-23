import { eq, inArray, asc } from "drizzle-orm"
import { db, orderItems, products } from "@/lib/db"
import type { CreateOrderInput, OrderItem } from "@/types/domain"

export const orderItemsService = {
  async loadByOrderIds(orderIds: string[]): Promise<Record<string, OrderItem[]>> {
    if (orderIds.length === 0) return {}

    const rows = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds))
      .orderBy(asc(orderItems.sortOrder))

    const productIds = [...new Set(rows.map((row) => row.productId))]
    const inventoryRows =
      productIds.length > 0
        ? await db
            .select({ id: products.id, inventory: products.inventory })
            .from(products)
            .where(inArray(products.id, productIds))
        : []
    const inventoryByProduct = new Map(
      inventoryRows.map((row) => [row.id, row.inventory])
    )

    const map: Record<string, OrderItem[]> = {}
    for (const id of orderIds) {
      map[id] = []
    }
    for (const row of rows) {
      map[row.orderId].push(serializeOrderItem(row, inventoryByProduct))
    }
    return map
  },

  async insertMany(orderId: string, items: CreateOrderInput["items"]) {
    if (items.length === 0) return

    await db.insert(orderItems).values(
      items.map((item, index) => ({
        orderId,
        productId: item.productId,
        name: item.name,
        displayName: item.displayName,
        price: item.price,
        quantity: item.quantity,
        selections: item.selections ?? {
          size: null,
          variations: [],
          modifiers: [],
        },
        sortOrder: index,
      }))
    )
  },
}

function serializeOrderItem(
  row: typeof orderItems.$inferSelect,
  inventoryByProduct: Map<string, number | null>
): OrderItem {
  return {
    productId: row.productId,
    name: row.name,
    displayName: row.displayName ?? undefined,
    price: row.price,
    quantity: row.quantity,
    selections: row.selections,
    inventory: inventoryByProduct.get(row.productId) ?? null,
  }
}
