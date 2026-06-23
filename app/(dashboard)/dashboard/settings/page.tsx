"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormInput } from "@/components/ui/form-input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import { StoreImageUpload } from "@/components/uploads/store-image-upload"
import { useStore } from "@/hooks/use-store"
import { useApiMutation } from "@/hooks/use-api"
import { STORE_CURRENCIES } from "@/lib/currencies"
import { storeQueryKeys } from "@/lib/invalidate-keys"
import type { CatalogLayout } from "@/types/domain"

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  whatsappNumber: z
    .string()
    .optional()
    .refine((value) => !value || isValidPhoneNumber(value), {
      message: "Enter a valid phone number",
    }),
  orderMode: z.enum(["whatsapp", "managed"]),
  catalogLayout: z.enum(["grid-2", "grid-3", "grid-4", "list", "masonry"]),
  isPublished: z.boolean(),
  currency: z.string().min(3).max(3),
  storefrontTier: z.enum(["basic", "premium"]),
})

const PAYMENT_PROVIDERS = [
  { provider: "Stripe", region: "Global", description: "Cards, wallets, subscriptions" },
  { provider: "Paystack", region: "Africa", description: "Cards, bank transfers, mobile money" },
  { provider: "Flutterwave", region: "Africa", description: "Multi-currency payments" },
  { provider: "Razorpay", region: "South Asia", description: "UPI, cards, netbanking" },
  { provider: "Mercado Pago", region: "LATAM", description: "Local payment methods" },
]

export default function SettingsPage() {
  const { store } = useStore()
  const updateStore = useApiMutation("PATCH /stores/:storeId", "PATCH", {
    successMessage: "Settings saved",
    invalidateKeys: store
      ? [
          ["GET /stores"],
          storeQueryKeys(store.id).stats,
          ["GET /products"],
        ]
      : [["GET /stores"]],
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: null,
      coverImageUrl: null,
      whatsappNumber: "",
      orderMode: "whatsapp",
      catalogLayout: "grid-3",
      isPublished: false,
      currency: "USD",
      storefrontTier: "basic",
    },
  })

  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        description: store.description ?? "",
        logoUrl: store.logoUrl,
        coverImageUrl: store.coverImageUrl,
        whatsappNumber: store.whatsappNumber ?? "",
        orderMode: store.orderMode,
        catalogLayout: store.catalogLayout,
        isPublished: store.isPublished,
        currency: store.currency ?? "USD",
        storefrontTier: store.storefrontTier ?? "basic",
      })
    }
  }, [store, form])

  if (!store) {
    return <p className="text-muted-foreground">Create a store first.</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-lg font-semibold">Store Settings</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await updateStore.mutateAsync({
              params: { storeId: store.id },
              body: values,
            })
          })}
          className="space-y-6"
        >
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic details about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
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
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STORE_CURRENCIES.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Used for all product prices, cart totals, and orders in this
                      store. Updating this also updates existing product currencies.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        Make your catalog visible to customers
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
              <FormField
                control={form.control}
                name="storefrontTier"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Premium storefront</FormLabel>
                      <FormDescription>
                        Paid plan — custom landing page, product pages, and search
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === "premium"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "premium" : "basic")
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Logo and cover image for your catalog</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StoreImageUpload
                        label="Store logo"
                        value={field.value}
                        onChange={field.onChange}
                        folder="uwa-catalog/stores/logos"
                        aspect="square"
                        variant="logo"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormControl>
                      <StoreImageUpload
                        label="Cover image"
                        value={field.value}
                        onChange={field.onChange}
                        folder="uwa-catalog/stores/covers"
                        aspect="cover"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Ordering</CardTitle>
              <CardDescription>How customers place orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="orderMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Mode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp Summary</SelectItem>
                        <SelectItem value="managed">Order Management</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      WhatsApp sends order details to your number. Managed lets you track orders in the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="US"
                        placeholder="Enter phone number"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Used for WhatsApp order summaries and your storefront contact link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Catalog Layout</CardTitle>
              <CardDescription>Default product display for your catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="catalogLayout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grid-2">2 Column Grid</SelectItem>
                        <SelectItem value="grid-3">3 Column Grid</SelectItem>
                        <SelectItem value="grid-4">4 Column Grid</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="masonry">Masonry</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={updateStore.isPending}>
            {updateStore.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Form>

      <Card className="shadow-none opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Payments
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Configure payment providers based on your region. Stores will be able to accept online payments when this feature launches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PAYMENT_PROVIDERS.map((p) => (
            <div
              key={p.provider}
              className="flex items-center justify-between border border-border p-4"
            >
              <div>
                <p className="font-medium">{p.provider}</p>
                <p className="text-sm text-muted-foreground">{p.description}</p>
              </div>
              <Badge variant="outline">{p.region}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
