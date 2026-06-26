"use client"

import type { Country } from "react-phone-number-input"
import { useMemo, useState } from "react"
import Image from "next/image"
import { isValidPhoneNumber } from "react-phone-number-input"
import { toast } from "sonner"
import {
  MessageCircleIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Modal, ModalBody, ModalFooter, ModalForm, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { useCart } from "./cart-context"
import { useCreateOrder } from "@/hooks/use-orders"
import { useValidateDiscount } from "@/hooks/use-discounts"
import { formatSelectionsLabel } from "@/lib/product-options"
import { formatMoney } from "@/lib/format"
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal,
} from "@/lib/checkout/totals"
import { getSiteUrl } from "@/lib/seo/site"
import {
  buildWhatsAppOrderMessage,
  defaultPhoneCountry,
  getCatalogOrigin,
  normalizeWhatsAppPhone,
  openWhatsAppChat,
  prepareWhatsAppChat,
} from "@/lib/whatsapp"
import {
  formatStockRemaining,
  getMaxCartQuantity,
  isInStock,
} from "@/lib/inventory"
import type { FulfillmentType, Order, Store } from "@/types/domain"

interface CartDrawerProps {
  store: Store
  showFab?: boolean
}

export function CartDrawer({ store, showFab = true }: CartDrawerProps) {
  const { cartOpen, setCartOpen, items, removeItem, updateQuantity, clearCart, itemCount } =
    useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("")
  const [showOptionalDetails, setShowOptionalDetails] = useState(false)
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup")
  const [discountInput, setDiscountInput] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    amount: number
  } | null>(null)
  const createOrder = useCreateOrder(store.id)
  const validateDiscount = useValidateDiscount()
  const isWhatsAppMode = store.orderMode === "whatsapp"

  const subtotal = useMemo(
    () =>
      calculateSubtotal(
        items.map((item) => ({
          price: item.unitPrice.toFixed(2),
          quantity: item.quantity,
        }))
      ),
    [items]
  )
  const deliveryFee = useMemo(
    () =>
      calculateDeliveryFee({
        subtotal,
        fulfillmentType,
        deliveryEnabled: store.deliveryEnabled ?? false,
        deliveryFee: store.deliveryFee ?? "0",
        freeDeliveryMinimum: store.freeDeliveryMinimum,
      }),
    [subtotal, fulfillmentType, store]
  )
  const discountAmount = appliedDiscount?.amount ?? 0
  const orderTotal = useMemo(
    () =>
      calculateOrderTotal({
        subtotal,
        deliveryFee,
        discountAmount,
      }),
    [subtotal, deliveryFee, discountAmount]
  )

  const phoneValid = customerPhone ? isValidPhoneNumber(customerPhone) : false
  const phoneDefaultCountry = defaultPhoneCountry(store.currency) as Country

  async function handleCheckout() {
    if (!customerName || !customerPhone || items.length === 0) return
    if (!phoneValid) {
      toast.error("Enter a valid phone number")
      return
    }
    if (isWhatsAppMode && !store.whatsappNumber) {
      toast.error("Store has no WhatsApp number configured")
      return
    }
    if (
      isWhatsAppMode &&
      store.whatsappNumber &&
      normalizeWhatsAppPhone(store.whatsappNumber).length < 8
    ) {
      toast.error("Store WhatsApp number is invalid — update it in Settings")
      return
    }

    if (
      fulfillmentType === "delivery" &&
      !(store.deliveryEnabled ?? false)
    ) {
      toast.error("Delivery is not available for this store")
      return
    }
    if (fulfillmentType === "delivery" && !customerAddress.trim()) {
      toast.error("Enter a delivery address")
      return
    }

    for (const item of items) {
      if (!isInStock(item.product)) {
        toast.error(`${item.product.name} is no longer in stock`)
        return
      }
      const maxQty = getMaxCartQuantity(item.product, items, item.quantity)
      if (item.quantity > maxQty) {
        toast.error(`Only ${maxQty} available for ${item.product.name}`)
        return
      }
    }

    const orderItems = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      displayName: i.displayName,
      productSlug: i.product.slug,
      price: i.unitPrice.toFixed(2),
      quantity: i.quantity,
      selections: i.selections,
    }))

    const whatsAppWindow =
      isWhatsAppMode && store.whatsappNumber ? prepareWhatsAppChat() : null

    let order: Order | null = null
    try {
      order = await createOrder.mutateAsync({
        body: {
          storeId: store.id,
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          customerAddress: customerAddress || undefined,
          customerCity: customerCity || undefined,
          items: orderItems,
          source: isWhatsAppMode ? "whatsapp" : "checkout",
          fulfillmentType,
          discountCode: appliedDiscount?.code,
        },
      })
    } catch {
      whatsAppWindow?.close()
      return
    }

    if (order.checkoutUrl) {
      clearCart()
      setCartOpen(false)
      window.location.assign(order.checkoutUrl)
      return
    }

    if (isWhatsAppMode && store.whatsappNumber) {
      const message = buildWhatsAppOrderMessage({
        storeName: store.name,
        storeSlug: store.slug,
        currency: store.currency,
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || undefined,
          address: customerAddress || undefined,
          city: customerCity || undefined,
        },
        items: orderItems,
        total: orderTotal,
        fulfillmentType,
        deliveryFee,
        discountAmount,
        discountCode: appliedDiscount?.code ?? null,
        origin: getCatalogOrigin(getSiteUrl()),
      })

      const opened = openWhatsAppChat(store.whatsappNumber, message, whatsAppWindow)
      if (!opened) {
        toast.error("Could not open WhatsApp. Check the store WhatsApp number.")
        return
      }
      toast.success("Order saved — send the message in WhatsApp to confirm")
    } else {
      toast.success("Order placed", {
        description: order.trackingUrl
          ? "Save your tracking link to check status later."
          : undefined,
      })
    }

    clearCart()
    setCartOpen(false)
    setCustomerName("")
    setCustomerPhone("")
    setCustomerEmail("")
    setCustomerAddress("")
    setCustomerCity("")
    setShowOptionalDetails(false)
    setFulfillmentType("pickup")
    setDiscountInput("")
    setAppliedDiscount(null)
  }

  async function handleApplyDiscount() {
    if (!discountInput.trim()) return
    try {
      const result = await validateDiscount.mutateAsync({
        body: {
          storeId: store.id,
          code: discountInput.trim(),
          subtotal: subtotal.toFixed(2),
        },
      })
      setAppliedDiscount({
        code: result.code.code,
        amount: parseFloat(result.discountAmount),
      })
      toast.success("Discount applied")
    } catch {
      setAppliedDiscount(null)
    }
  }

  return (
    <>
      {showFab ? (
        <Button
          className="fixed right-4 bottom-4 z-40 size-12 shadow-lg"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCartIcon className="size-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center bg-destructive text-xs text-destructive-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      ) : null}

      <Modal
        open={cartOpen}
        onOpenChange={setCartOpen}
        mobileFullscreen
        className="border-0 shadow-lg"
      >
        <ModalHeader
          className="border-0 px-4 sm:px-6"
          onClose={() => setCartOpen(false)}
        >
          <ModalTitle>Your Cart ({itemCount})</ModalTitle>
        </ModalHeader>
        <ModalBody className="px-4 sm:px-6">
          <ModalForm className="my-0 max-w-none space-y-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Your cart is empty</p>
          ) : (
            items.map((item) => {
              const stockLabel = formatStockRemaining(
                item.product,
                items,
                item.quantity
              )
              const maxQty = getMaxCartQuantity(
                item.product,
                items,
                item.quantity
              )
              const atMax = Number.isFinite(maxQty) && item.quantity >= maxQty

              return (
              <div key={item.lineKey} className="flex gap-3 py-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                  {item.product.images?.[0]?.url ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-medium">{item.product.name}</span>
                      {item.selections.size ||
                      item.selections.variations.length > 0 ||
                      item.selections.modifiers.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {formatSelectionsLabel(item.selections)}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.lineKey)}
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground whitespace-nowrap">
                    {formatMoney(item.unitPrice, store.currency)}
                  </span>
                  {stockLabel ? (
                    <span className="text-xs text-muted-foreground">
                      {stockLabel}
                    </span>
                  ) : null}
                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        updateQuantity(item.lineKey, item.quantity - 1)
                      }
                      aria-label={`Decrease ${item.product.name} quantity`}
                    >
                      <MinusIcon className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={atMax}
                      onClick={() =>
                        updateQuantity(item.lineKey, item.quantity + 1)
                      }
                      aria-label={`Increase ${item.product.name} quantity`}
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )})
          )}

          {items.length > 0 && (
            <div className="space-y-3 rounded-xl bg-muted/30 p-4">
              {(store.pickupEnabled ?? true) || (store.deliveryEnabled ?? false) ? (
                <div className="grid grid-cols-2 gap-2">
                  {(store.pickupEnabled ?? true) ? (
                    <Button
                      type="button"
                      variant={fulfillmentType === "pickup" ? "default" : "outline"}
                      onClick={() => setFulfillmentType("pickup")}
                    >
                      Pickup
                    </Button>
                  ) : null}
                  {(store.deliveryEnabled ?? false) ? (
                    <Button
                      type="button"
                      variant={fulfillmentType === "delivery" ? "default" : "outline"}
                      onClick={() => setFulfillmentType("delivery")}
                    >
                      Delivery
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <FormInput
                  className="bg-background pl-9"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <PhoneInput
                className="bg-background"
                defaultCountry={phoneDefaultCountry}
                placeholder="Your phone number"
                value={customerPhone}
                onChange={(value) => setCustomerPhone(value ?? "")}
              />
              <button
                type="button"
                className="text-left text-sm text-primary underline-offset-4 hover:underline"
                onClick={() => setShowOptionalDetails((open) => !open)}
              >
                {showOptionalDetails
                  ? "Hide optional details"
                  : fulfillmentType === "delivery"
                    ? "Add email or delivery details"
                    : "Add email or delivery details (optional)"}
              </button>
              {showOptionalDetails ? (
                <div className="space-y-3">
                  <FormInput
                    className="bg-background"
                    type="email"
                    placeholder="Email (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <FormInput
                    className="bg-background"
                    placeholder="Address (optional)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                  <FormInput
                    className="bg-background"
                    placeholder="City (optional)"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                  />
                </div>
              ) : null}
              <div className="flex gap-2">
                <FormInput
                  className="bg-background"
                  placeholder="Discount code"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!discountInput || validateDiscount.isPending}
                  onClick={handleApplyDiscount}
                >
                  Apply
                </Button>
              </div>
              {appliedDiscount ? (
                <p className="text-sm text-green-700">
                  {appliedDiscount.code} applied (-{formatMoney(appliedDiscount.amount, store.currency)})
                </p>
              ) : null}
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatMoney(subtotal, store.currency)}</span>
                </div>
                {deliveryFee > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="tabular-nums">{formatMoney(deliveryFee, store.currency)}</span>
                  </div>
                ) : null}
                {discountAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="tabular-nums">-{formatMoney(discountAmount, store.currency)}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-2">
                  <ReceiptIcon className="size-4 text-muted-foreground" />
                  Total
                </span>
                <span className="text-lg tabular-nums whitespace-nowrap">
                  {formatMoney(orderTotal, store.currency)}
                </span>
              </div>
            </div>
          )}
          </ModalForm>
        </ModalBody>
        {items.length > 0 && (
          <ModalFooter className="border-0 px-4 sm:px-6">
            <Button
              className="w-full gap-2"
              disabled={!customerName || !phoneValid || createOrder.isPending}
              onClick={handleCheckout}
            >
              {createOrder.isPending ? (
                "Processing..."
              ) : isWhatsAppMode ? (
                <>
                  <MessageCircleIcon className="size-4" />
                  Order via WhatsApp
                </>
              ) : (
                <>
                  <ReceiptIcon className="size-4" />
                  Place order
                </>
              )}
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </>
  )
}
