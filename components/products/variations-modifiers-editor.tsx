"use client"

import { PlusIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createDefaultModifierGroup,
  createDefaultOption,
  createDefaultSize,
  createDefaultVariationGroup,
  generateId,
} from "@/lib/product-options"
import { OptionImageUpload } from "@/components/uploads/option-image-upload"
import type {
  ProductModifierGroup,
  ProductOption,
  ProductSize,
  ProductVariationGroup,
} from "@/types/domain"

interface ProductOptionsEditorProps {
  sizes: ProductSize[]
  variations: ProductVariationGroup[]
  modifiers: ProductModifierGroup[]
  onSizesChange: (sizes: ProductSize[]) => void
  onVariationsChange: (variations: ProductVariationGroup[]) => void
  onModifiersChange: (modifiers: ProductModifierGroup[]) => void
}

export function ProductOptionsEditor({
  sizes,
  variations,
  modifiers,
  onSizesChange,
  onVariationsChange,
  onModifiersChange,
}: ProductOptionsEditorProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Sizes</h3>
            <p className="text-xs text-muted-foreground">
              Flat size list (e.g. S, M, L, XL) with optional price adjustments
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSizesChange([...sizes, createDefaultSize()])}
          >
            <PlusIcon className="size-4" />
            Add size
          </Button>
        </div>

        {sizes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sizes added.</p>
        ) : (
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price adj.</TableHead>
                  <TableHead className="w-20">Active</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizes.map((size, index) => (
                  <TableRow key={size.id}>
                    <TableCell>
                      <FormInput
                        placeholder="e.g. Large"
                        value={size.name}
                        onChange={(e) => {
                          const next = [...sizes]
                          next[index] = { ...size, name: e.target.value }
                          onSizesChange(next)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormInput
                        placeholder="+0.00"
                        value={size.priceAdjustment}
                        onChange={(e) => {
                          const next = [...sizes]
                          next[index] = {
                            ...size,
                            priceAdjustment: e.target.value,
                          }
                          onSizesChange(next)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={size.isActive !== false}
                        onCheckedChange={(checked) => {
                          const next = [...sizes]
                          next[index] = { ...size, isActive: !!checked }
                          onSizesChange(next)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onSizesChange(sizes.filter((_, i) => i !== index))
                        }
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Variations</h3>
            <p className="text-xs text-muted-foreground">
              One choice per group (e.g. Crust type, Spice level)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onVariationsChange([...variations, createDefaultVariationGroup()])
            }
          >
            <PlusIcon className="size-4" />
            Add variation group
          </Button>
        </div>

        {variations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variations added.</p>
        ) : (
          variations.map((group, groupIndex) => (
            <VariationGroupEditor
              key={group.id}
              group={group}
              onChange={(nextGroup) => {
                const next = [...variations]
                next[groupIndex] = nextGroup
                onVariationsChange(next)
              }}
              onRemove={() =>
                onVariationsChange(variations.filter((_, i) => i !== groupIndex))
              }
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Modifiers</h3>
            <p className="text-xs text-muted-foreground">
              Optional add-ons with min/max rules
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onModifiersChange([...modifiers, createDefaultModifierGroup()])
            }
          >
            <PlusIcon className="size-4" />
            Add modifier group
          </Button>
        </div>

        {modifiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modifiers added.</p>
        ) : (
          modifiers.map((group, groupIndex) => (
            <ModifierGroupEditor
              key={group.id}
              group={group}
              onChange={(nextGroup) => {
                const next = [...modifiers]
                next[groupIndex] = nextGroup
                onModifiersChange(next)
              }}
              onRemove={() =>
                onModifiersChange(modifiers.filter((_, i) => i !== groupIndex))
              }
            />
          ))
        )}
      </section>
    </div>
  )
}

function VariationGroupEditor({
  group,
  onChange,
  onRemove,
}: {
  group: ProductVariationGroup
  onChange: (group: ProductVariationGroup) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-3 border border-border p-4">
      <div className="flex items-center gap-2">
        <FormInput
          placeholder="Group name"
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <TrashIcon className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`var-required-${group.id}`}
          checked={group.required}
          onCheckedChange={(checked) => onChange({ ...group, required: !!checked })}
        />
        <Label htmlFor={`var-required-${group.id}`} className="text-sm">
          Required
        </Label>
      </div>
      <OptionsTable
        options={group.options}
        onChange={(options) => onChange({ ...group, options })}
      />
    </div>
  )
}

function ModifierGroupEditor({
  group,
  onChange,
  onRemove,
}: {
  group: ProductModifierGroup
  onChange: (group: ProductModifierGroup) => void
  onRemove: () => void
}) {
  return (
    <div className="space-y-3 border border-border p-4">
      <div className="flex items-center gap-2">
        <FormInput
          placeholder="Group name"
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <TrashIcon className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`mod-required-${group.id}`}
            checked={group.required}
            onCheckedChange={(checked) =>
              onChange({ ...group, required: !!checked })
            }
          />
          <Label htmlFor={`mod-required-${group.id}`} className="text-sm">
            Required
          </Label>
        </div>
        <FormInput
          type="number"
          placeholder="Min"
          value={group.minSelections}
          onChange={(e) =>
            onChange({ ...group, minSelections: Number(e.target.value) || 0 })
          }
        />
        <FormInput
          type="number"
          placeholder="Max (0=unlimited)"
          value={group.maxSelections}
          onChange={(e) =>
            onChange({ ...group, maxSelections: Number(e.target.value) || 0 })
          }
        />
      </div>
      <OptionsTable
        options={group.options}
        onChange={(options) => onChange({ ...group, options })}
      />
    </div>
  )
}

function OptionsTable({
  options,
  onChange,
}: {
  options: ProductOption[]
  onChange: (options: ProductOption[]) => void
}) {
  return (
    <div className="space-y-2">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Option</TableHead>
              <TableHead className="w-32">Price adj.</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option, optionIndex) => (
              <TableRow key={option.id}>
                <TableCell>
                  <OptionImageUpload
                    value={option.image}
                    onChange={(image) => {
                      const next = [...options]
                      next[optionIndex] = { ...option, image }
                      onChange(next)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormInput
                    placeholder="Option name"
                    value={option.name}
                    onChange={(e) => {
                      const next = [...options]
                      next[optionIndex] = { ...option, name: e.target.value }
                      onChange(next)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormInput
                    placeholder="+0.00"
                    value={option.priceAdjustment}
                    onChange={(e) => {
                      const next = [...options]
                      next[optionIndex] = {
                        ...option,
                        priceAdjustment: e.target.value,
                      }
                      onChange(next)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onChange(options.filter((_, i) => i !== optionIndex))
                    }
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...options, { ...createDefaultOption(), id: generateId() }])
        }
      >
        Add option
      </Button>
    </div>
  )
}

/** @deprecated Use ProductOptionsEditor */
export const VariationsModifiersEditor = ProductOptionsEditor
