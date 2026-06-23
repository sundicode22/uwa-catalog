import { eq, inArray, count } from "drizzle-orm"
import {
  db,
  productSizes,
  productVariationGroups,
  productVariationOptions,
  productModifierGroups,
  productModifierOptions,
} from "@/lib/db"
import type {
  ProductModifierGroup,
  ProductOptionCounts,
  ProductOptionsPayload,
  ProductSize,
  ProductVariationGroup,
} from "@/types/domain"

export const productOptionsService = {
  async load(productId: string): Promise<ProductOptionsPayload> {
    const [sizes, variationGroups, modifierGroups] = await Promise.all([
      db
        .select()
        .from(productSizes)
        .where(eq(productSizes.productId, productId))
        .orderBy(productSizes.sortOrder),
      db
        .select()
        .from(productVariationGroups)
        .where(eq(productVariationGroups.productId, productId))
        .orderBy(productVariationGroups.sortOrder),
      db
        .select()
        .from(productModifierGroups)
        .where(eq(productModifierGroups.productId, productId))
        .orderBy(productModifierGroups.sortOrder),
    ])

    const variationGroupIds = variationGroups.map((g) => g.id)
    const modifierGroupIds = modifierGroups.map((g) => g.id)

    const [variationOptions, modifierOptions] = await Promise.all([
      variationGroupIds.length > 0
        ? db
            .select()
            .from(productVariationOptions)
            .where(inArray(productVariationOptions.groupId, variationGroupIds))
            .orderBy(productVariationOptions.sortOrder)
        : Promise.resolve([]),
      modifierGroupIds.length > 0
        ? db
            .select()
            .from(productModifierOptions)
            .where(inArray(productModifierOptions.groupId, modifierGroupIds))
            .orderBy(productModifierOptions.sortOrder)
        : Promise.resolve([]),
    ])

    const variations: ProductVariationGroup[] = variationGroups.map((group) => ({
      id: group.id,
      name: group.name,
      required: group.required,
      options: variationOptions
        .filter((o) => o.groupId === group.id)
        .map((o) => ({
          id: o.id,
          name: o.name,
          priceAdjustment: o.priceAdjustment,
          image: o.image ?? null,
        })),
    }))

    const modifiers: ProductModifierGroup[] = modifierGroups.map((group) => ({
      id: group.id,
      name: group.name,
      required: group.required,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
      options: modifierOptions
        .filter((o) => o.groupId === group.id)
        .map((o) => ({
          id: o.id,
          name: o.name,
          priceAdjustment: o.priceAdjustment,
          image: o.image ?? null,
        })),
    }))

    return {
      sizes: sizes.map(serializeSize),
      variations,
      modifiers,
    }
  },

  async getCounts(productIds: string[]): Promise<Record<string, ProductOptionCounts>> {
    if (productIds.length === 0) return {}

    const [sizeCounts, variationCounts, modifierCounts] = await Promise.all([
      db
        .select({ productId: productSizes.productId, count: count() })
        .from(productSizes)
        .where(inArray(productSizes.productId, productIds))
        .groupBy(productSizes.productId),
      db
        .select({ productId: productVariationGroups.productId, count: count() })
        .from(productVariationGroups)
        .where(inArray(productVariationGroups.productId, productIds))
        .groupBy(productVariationGroups.productId),
      db
        .select({ productId: productModifierGroups.productId, count: count() })
        .from(productModifierGroups)
        .where(inArray(productModifierGroups.productId, productIds))
        .groupBy(productModifierGroups.productId),
    ])

    const result: Record<string, ProductOptionCounts> = {}
    for (const id of productIds) {
      result[id] = { sizes: 0, variationGroups: 0, modifierGroups: 0 }
    }
    for (const row of sizeCounts) {
      result[row.productId].sizes = row.count
    }
    for (const row of variationCounts) {
      result[row.productId].variationGroups = row.count
    }
    for (const row of modifierCounts) {
      result[row.productId].modifierGroups = row.count
    }
    return result
  },

  async sync(productId: string, payload: ProductOptionsPayload) {
    await db.transaction(async (tx) => {
      await tx.delete(productSizes).where(eq(productSizes.productId, productId))
      await tx
        .delete(productVariationGroups)
        .where(eq(productVariationGroups.productId, productId))
      await tx
        .delete(productModifierGroups)
        .where(eq(productModifierGroups.productId, productId))

      if (payload.sizes.length > 0) {
        await tx.insert(productSizes).values(
          payload.sizes.map((size, index) => ({
            id: size.id,
            productId,
            name: size.name,
            priceAdjustment: size.priceAdjustment ?? "0",
            sortOrder: size.sortOrder ?? index,
            isActive: size.isActive ?? true,
          }))
        )
      }

      for (const [groupIndex, group] of payload.variations.entries()) {
        if (!group.name.trim()) continue
        await tx.insert(productVariationGroups).values({
          id: group.id,
          productId,
          name: group.name.trim(),
          required: group.required,
          sortOrder: groupIndex,
        })

        const options = group.options.filter((o) => o.name.trim())
        if (options.length > 0) {
          await tx.insert(productVariationOptions).values(
            options.map((option, optionIndex) => ({
              id: option.id,
              groupId: group.id,
              name: option.name.trim(),
              priceAdjustment: option.priceAdjustment ?? "0",
              image: option.image ?? null,
              sortOrder: optionIndex,
            }))
          )
        }
      }

      for (const [groupIndex, group] of payload.modifiers.entries()) {
        if (!group.name.trim()) continue
        await tx.insert(productModifierGroups).values({
          id: group.id,
          productId,
          name: group.name.trim(),
          required: group.required,
          minSelections: group.minSelections,
          maxSelections: group.maxSelections,
          sortOrder: groupIndex,
        })

        const options = group.options.filter((o) => o.name.trim())
        if (options.length > 0) {
          await tx.insert(productModifierOptions).values(
            options.map((option, optionIndex) => ({
              id: option.id,
              groupId: group.id,
              name: option.name.trim(),
              priceAdjustment: option.priceAdjustment ?? "0",
              image: option.image ?? null,
              sortOrder: optionIndex,
            }))
          )
        }
      }
    })
  },
}

function serializeSize(size: typeof productSizes.$inferSelect): ProductSize {
  return {
    id: size.id,
    productId: size.productId,
    name: size.name,
    priceAdjustment: size.priceAdjustment,
    sortOrder: size.sortOrder,
    isActive: size.isActive,
  }
}
