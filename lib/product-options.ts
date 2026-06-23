import type {
  ProductModifierGroup,
  ProductOptionCounts,
  ProductSize,
  ProductVariationGroup,
  SelectedSize,
  ProductSelections,
} from "@/types/domain"

export function generateId() {
  return crypto.randomUUID()
}

export function calculateUnitPrice(
  basePrice: string,
  selections: ProductSelections
): number {
  const base = parseFloat(basePrice) || 0
  const sizeAdj = selections.size
    ? parseFloat(selections.size.priceAdjustment) || 0
    : 0
  const variationAdj = selections.variations.reduce(
    (sum, v) => sum + (parseFloat(v.priceAdjustment) || 0),
    0
  )
  const modifierAdj = selections.modifiers.reduce(
    (sum, m) => sum + (parseFloat(m.priceAdjustment) || 0),
    0
  )
  return base + sizeAdj + variationAdj + modifierAdj
}

export function formatSelectionsLabel(selections: ProductSelections): string {
  const parts = [
    selections.size?.sizeName,
    ...selections.variations.map((v) => v.optionName),
    ...selections.modifiers.map((m) => m.optionName),
  ].filter(Boolean)
  return parts.join(", ")
}

export function buildDisplayName(
  productName: string,
  selections: ProductSelections
): string {
  const label = formatSelectionsLabel(selections)
  return label ? `${productName} (${label})` : productName
}

export function cartLineKey(
  productId: string,
  selections: ProductSelections
): string {
  const sizeKey = selections.size ? `size:${selections.size.sizeId}` : ""
  const variationKey = selections.variations
    .map((v) => `${v.groupId}:${v.optionId}`)
    .sort()
    .join("|")
  const modifierKey = selections.modifiers
    .map((m) => `${m.groupId}:${m.optionId}`)
    .sort()
    .join("|")
  return `${productId}::${sizeKey}::${variationKey}::${modifierKey}`
}

export function productHasOptions(product: {
  optionCounts?: ProductOptionCounts
  sizes?: ProductSize[]
  variations?: ProductVariationGroup[]
  modifiers?: ProductModifierGroup[]
}): boolean {
  if (product.optionCounts) {
    const c = product.optionCounts
    return c.sizes > 0 || c.variationGroups > 0 || c.modifierGroups > 0
  }
  return (
    (product.sizes?.length ?? 0) > 0 ||
    (product.variations?.length ?? 0) > 0 ||
    (product.modifiers?.length ?? 0) > 0
  )
}

export function validateSelections(
  sizes: ProductSize[],
  variations: ProductVariationGroup[],
  modifiers: ProductModifierGroup[],
  selections: ProductSelections
): string | null {
  const activeSizes = sizes.filter((s) => s.isActive !== false)
  if (activeSizes.length > 0 && !selections.size) {
    return "Please select a size"
  }

  for (const group of variations) {
    if (!group.required) continue
    const selected = selections.variations.find((v) => v.groupId === group.id)
    if (!selected) return `Please select ${group.name}`
  }

  for (const group of modifiers) {
    const selected = selections.modifiers.filter((m) => m.groupId === group.id)
    if (group.required && selected.length < Math.max(1, group.minSelections)) {
      return `Please select at least one option for ${group.name}`
    }
    if (group.maxSelections > 0 && selected.length > group.maxSelections) {
      return `Too many selections for ${group.name}`
    }
  }

  return null
}

export function emptySelections(): ProductSelections {
  return { size: null, variations: [], modifiers: [] }
}

export function createDefaultOption(name = "") {
  return { id: generateId(), name, priceAdjustment: "0", image: null }
}

export function createDefaultSize(): ProductSize {
  return {
    id: generateId(),
    name: "",
    priceAdjustment: "0",
    sortOrder: 0,
    isActive: true,
  }
}

export function createDefaultVariationGroup(): ProductVariationGroup {
  return {
    id: generateId(),
    name: "",
    required: true,
    options: [createDefaultOption()],
  }
}

export function createDefaultModifierGroup(): ProductModifierGroup {
  return {
    id: generateId(),
    name: "",
    required: false,
    minSelections: 0,
    maxSelections: 0,
    options: [createDefaultOption()],
  }
}

export function mapSizeSelection(
  sizes: ProductSize[],
  sizeId: string
): SelectedSize | null {
  const size = sizes.find((s) => s.id === sizeId)
  if (!size) return null
  return {
    sizeId: size.id,
    sizeName: size.name,
    priceAdjustment: size.priceAdjustment,
  }
}

export function mapVariationSelection(
  group: ProductVariationGroup,
  optionId: string
) {
  const option = group.options.find((o) => o.id === optionId)
  if (!option) return null
  return {
    groupId: group.id,
    groupName: group.name,
    optionId: option.id,
    optionName: option.name,
    priceAdjustment: option.priceAdjustment,
  }
}

export function mapModifierSelection(
  group: ProductModifierGroup,
  optionId: string
) {
  const option = group.options.find((o) => o.id === optionId)
  if (!option) return null
  return {
    groupId: group.id,
    groupName: group.name,
    optionId: option.id,
    optionName: option.name,
    priceAdjustment: option.priceAdjustment,
  }
}
