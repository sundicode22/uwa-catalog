"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ImageUploader } from "@/components/uploads/image-uploader"
import { ProductOptionsEditor } from "@/components/products/variations-modifiers-editor"
import { useCategories } from "@/hooks/use-categories"
import { useProductOptions } from "@/hooks/use-products"
import { useStore } from "@/hooks/use-store"
import { getCurrencyLabel } from "@/lib/currencies"
import { resolveStoreCurrency } from "@/lib/currency"
import { formatMoney } from "@/lib/format"
import type {
  Product,
  ProductModifierGroup,
  ProductSize,
  ProductVariationGroup,
} from "@/types/domain"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  categoryId: z.string().optional(),
  images: z.array(z.object({ url: z.string(), publicId: z.string() })),
  isFeatured: z.boolean(),
  trackInventory: z.boolean(),
  inventory: z.string().optional(),
})

export type ProductFormValues = Omit<z.infer<typeof schema>, "inventory"> & {
  inventory: number | null
  sizes: ProductSize[]
  variations: ProductVariationGroup[]
  modifiers: ProductModifierGroup[]
}

interface ProductFormProps {
  product?: Product | null
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  loadOptions?: boolean
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
  loadOptions = !!product,
}: ProductFormProps) {
  const { data: categories } = useCategories()
  const { store } = useStore()
  const storeCurrency = resolveStoreCurrency(store)
  const { data: loadedOptions, isLoading: optionsLoading } = useProductOptions(
    product?.id,
    loadOptions && !!product
  )
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [variations, setVariations] = useState<ProductVariationGroup[]>([])
  const [modifiers, setModifiers] = useState<ProductModifierGroup[]>([])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      images: [],
      isFeatured: false,
      trackInventory: false,
      inventory: "",
    },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        categoryId: product.categoryId ?? "",
        images: product.images ?? [],
        isFeatured: product.isFeatured ?? false,
        trackInventory: product.inventory !== null && product.inventory !== undefined,
        inventory: product.inventory?.toString() ?? "",
      })
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        images: [],
        isFeatured: false,
        trackInventory: false,
        inventory: "",
      })
      setSizes([])
      setVariations([])
      setModifiers([])
    }
  }, [product, form, storeCurrency])

  useEffect(() => {
    if (!product || !loadedOptions) return
    setSizes(loadedOptions.sizes)
    setVariations(loadedOptions.variations)
    setModifiers(loadedOptions.modifiers)
  }, [product, loadedOptions])

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async (values) => {
          const { trackInventory, inventory: inventoryInput, ...rest } = values
          const parsedInventory = trackInventory
            ? Number.parseInt(inventoryInput ?? "0", 10)
            : null

          await onSubmit({
            ...rest,
            trackInventory,
            inventory: Number.isNaN(parsedInventory) ? 0 : parsedInventory,
            sizes: sizes.filter((s) => s.name.trim()),
            variations: variations.filter((g) => g.name.trim()),
            modifiers: modifiers.filter((g) => g.name.trim()),
          })
        })}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base price</FormLabel>
                  <FormControl>
                    <FormInput type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {getCurrencyLabel(storeCurrency)} — set in{" "}
                <a href="/dashboard/settings" className="text-primary underline-offset-4 hover:underline">
                  store settings
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                Preview: {formatMoney(form.watch("price") || "0", storeCurrency)}
              </p>
            </FormItem>
          </div>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUploader value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackInventory"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between border border-border p-4">
                <div>
                  <FormLabel>Track inventory</FormLabel>
                  <FormDescription>
                    Limit how many units can be sold. Leave off for unlimited stock.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch("trackInventory") ? (
            <FormField
              control={form.control}
              name="inventory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock quantity</FormLabel>
                  <FormControl>
                    <FormInput type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between border border-border p-4">
                <div>
                  <FormLabel>Featured product</FormLabel>
                  <FormDescription>
                    Show in the catalog hero carousel
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {optionsLoading && product ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <ProductOptionsEditor
              sizes={sizes}
              variations={variations}
              modifiers={modifiers}
              onSizesChange={setSizes}
              onVariationsChange={setVariations}
              onModifiersChange={setModifiers}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading || optionsLoading}>
            {isLoading ? "Saving..." : product ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
