"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductOptions } from "@/hooks/use-products"
import { formatMoney } from "@/lib/format"
import {
  formatInventoryLabel,
  getAvailableStock,
  isInStock,
} from "@/lib/inventory"
import {
  calculateUnitPrice,
  emptySelections,
  mapModifierSelection,
  mapSizeSelection,
  mapVariationSelection,
  validateSelections,
} from "@/lib/product-options"
import { cn } from "@/lib/utils"
import type { Product, ProductOption, ProductSelections, ProductVariationGroup } from "@/types/domain"
import { useCart } from "./cart-context"

interface ProductOptionsModalProps {
  product: Product | null
  storeCurrency?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (product: Product, selections: ProductSelections, unitPrice: number) => void
}

function formatAdjustment(value: string, currency: string) {
  const amount = parseFloat(value)
  if (Number.isNaN(amount) || amount === 0) return null
  const formatted = formatMoney(Math.abs(amount), currency)
  return amount > 0 ? `+${formatted}` : `-${formatted}`
}

function optionLabel(name: string, adjustment: string, currency: string) {
  const adj = formatAdjustment(adjustment, currency)
  return adj ? `${name} (${adj})` : name
}

function hasOptionImages(options: ProductOption[]) {
  return options.some((option) => option.image?.url)
}

function OptionThumbnail({
  image,
  name,
  className,
}: {
  image?: ProductOption["image"]
  name: string
  className?: string
}) {
  if (!image?.url) return null
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted", className)}>
      <Image src={image.url} alt={name} fill className="object-cover" />
    </div>
  )
}

function VariationPicker({
  group,
  currency,
  selectedOptionId,
  onSelect,
}: {
  group: ProductVariationGroup
  currency: string
  selectedOptionId?: string
  onSelect: (optionId: string) => void
}) {
  const useImageGrid = hasOptionImages(group.options)

  if (!useImageGrid) {
    return (
      <Select value={selectedOptionId ?? ""} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${group.name.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {group.options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {optionLabel(option.name, option.priceAdjustment, currency)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {group.options.map((option) => {
        const selected = selectedOptionId === option.id
        const adj = formatAdjustment(option.priceAdjustment, currency)
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "rounded-lg border p-2 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <OptionThumbnail
              image={option.image}
              name={option.name}
              className="mb-2 aspect-square w-full"
            />
            <span className="block text-sm font-medium">{option.name}</span>
            {adj ? (
              <span className="text-xs text-muted-foreground">{adj}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function ProductOptionsModal({
  product,
  storeCurrency,
  open,
  onOpenChange,
  onConfirm,
}: ProductOptionsModalProps) {
  const { data: options, isLoading } = useProductOptions(product?.id, open && !!product)
  const { items } = useCart()
  const [selections, setSelections] = useState<ProductSelections>(emptySelections())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSelections(emptySelections())
      setError(null)
    }
  }, [open, product?.id])

  if (!product) return null

  const currency = storeCurrency ?? product.currency
  const sizes = options?.sizes.filter((s) => s.isActive !== false) ?? []
  const variations = options?.variations ?? []
  const modifiers = options?.modifiers ?? []
  const unitPrice = calculateUnitPrice(product.price, selections)
  const image = product.images?.[0]?.url
  const inventoryLabel = formatInventoryLabel(product.inventory)
  const availableStock = getAvailableStock(product, items)
  const canAdd = isInStock(product) && availableStock > 0

  function handleSizeChange(sizeId: string) {
    const selected = mapSizeSelection(sizes, sizeId)
    setSelections((prev) => ({ ...prev, size: selected }))
  }

  function handleVariationChange(groupId: string, optionId: string) {
    const group = variations.find((g) => g.id === groupId)
    if (!group) return
    const selected = mapVariationSelection(group, optionId)
    if (!selected) return
    setSelections((prev) => ({
      ...prev,
      variations: [
        ...prev.variations.filter((v) => v.groupId !== groupId),
        selected,
      ],
    }))
  }

  function handleModifierChange(groupId: string, optionId: string) {
    const group = modifiers.find((g) => g.id === groupId)
    if (!group) return
    const selected = mapModifierSelection(group, optionId)
    if (!selected) return
    setSelections((prev) => ({
      ...prev,
      modifiers: [
        ...prev.modifiers.filter((m) => m.groupId !== groupId),
        selected,
      ],
    }))
  }

  function toggleModifier(groupId: string, optionId: string) {
    const group = modifiers.find((g) => g.id === groupId)
    if (!group) return
    const selected = mapModifierSelection(group, optionId)
    if (!selected) return

    setSelections((prev) => {
      const isSelected = prev.modifiers.some(
        (m) => m.groupId === groupId && m.optionId === optionId
      )
      if (isSelected) {
        return {
          ...prev,
          modifiers: prev.modifiers.filter(
            (m) => !(m.groupId === groupId && m.optionId === optionId)
          ),
        }
      }

      const currentInGroup = prev.modifiers.filter((m) => m.groupId === groupId)
      if (group.maxSelections > 0 && currentInGroup.length >= group.maxSelections) {
        return prev
      }

      return {
        ...prev,
        modifiers: [...prev.modifiers, selected],
      }
    })
  }

  function handleAdd() {
    if (!product || !options) return
    const validationError = validateSelections(
      sizes,
      variations,
      modifiers,
      selections
    )
    if (validationError) {
      toast.error(validationError)
      setError(validationError)
      return
    }
    onConfirm(product, selections, unitPrice)
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalHeader onClose={() => onOpenChange(false)}>
        <ModalTitle>{product.name}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalForm className="my-0 w-full max-w-lg space-y-6">
          <div className="flex items-start gap-4 border border-border p-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {image ? (
                <Image src={image} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="size-full bg-muted" />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                Base price: {formatMoney(product.price, currency)}
              </p>
              {inventoryLabel ? (
                <p
                  className={cn(
                    "text-sm",
                    !isInStock(product) || availableStock <= 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {availableStock > 0 && availableStock <= 5
                    ? `${availableStock} left in stock`
                    : inventoryLabel}
                </p>
              ) : null}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              {sizes.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Size <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selections.size?.sizeId ?? ""}
                    onValueChange={handleSizeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {optionLabel(size.name, size.priceAdjustment, currency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {variations.map((group) => (
                <div key={group.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {group.name}
                    {group.required ? (
                      <span className="text-destructive"> *</span>
                    ) : null}
                  </Label>
                  <VariationPicker
                    group={group}
                    currency={currency}
                    selectedOptionId={
                      selections.variations.find((v) => v.groupId === group.id)
                        ?.optionId
                    }
                    onSelect={(optionId) =>
                      handleVariationChange(group.id, optionId)
                    }
                  />
                </div>
              ))}

              {modifiers.map((group) => {
                const isSingleSelect = group.maxSelections === 1

                if (isSingleSelect) {
                  return (
                    <div key={group.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {group.name}
                        {group.required ? (
                          <span className="text-destructive"> *</span>
                        ) : null}
                      </Label>
                      <Select
                        value={
                          selections.modifiers.find((m) => m.groupId === group.id)
                            ?.optionId ?? ""
                        }
                        onValueChange={(optionId) =>
                          handleModifierChange(group.id, optionId)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${group.name.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {group.options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              <span className="flex items-center gap-2">
                                {option.image?.url ? (
                                  <span className="relative size-6 shrink-0 overflow-hidden rounded">
                                    <Image
                                      src={option.image.url}
                                      alt=""
                                      fill
                                      className="object-cover"
                                    />
                                  </span>
                                ) : null}
                                {optionLabel(
                                  option.name,
                                  option.priceAdjustment,
                                  currency
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }

                return (
                  <div key={group.id} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {group.name}
                      {group.required ? (
                        <span className="text-destructive"> *</span>
                      ) : null}
                    </Label>
                    <div className="space-y-2">
                      {group.options.map((option) => {
                        const selected = selections.modifiers.some(
                          (m) => m.groupId === group.id && m.optionId === option.id
                        )
                        const adj = formatAdjustment(
                          option.priceAdjustment,
                          currency
                        )
                        return (
                          <label
                            key={option.id}
                            className={cn(
                              "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() =>
                                  toggleModifier(group.id, option.id)
                                }
                              />
                              {option.image?.url ? (
                                <span className="relative size-8 shrink-0 overflow-hidden rounded-md">
                                  <Image
                                    src={option.image.url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                </span>
                              ) : null}
                              <span className="text-sm font-medium">{option.name}</span>
                            </span>
                            {adj ? (
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {adj}
                              </span>
                            ) : null}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-between border-t border-border pt-4 text-lg font-semibold sm:text-xl">
            <span>Total</span>
            <span className="tabular-nums whitespace-nowrap">
              {formatMoney(unitPrice, currency)}
            </span>
          </div>
        </ModalForm>
      </ModalBody>
      <ModalFooter>
        <Button
          className="w-full sm:w-auto"
          disabled={isLoading || !canAdd}
          onClick={handleAdd}
        >
          {canAdd ? "Add to cart" : "Out of stock"}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
