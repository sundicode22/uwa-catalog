"use client"

import { useState } from "react"
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
import { formatSelectionsLabel } from "@/lib/product-options"
import { formatMoney } from "@/lib/format"
import { absoluteUrl } from "@/lib/seo/site"
import { getProductPath } from "@/lib/seo/paths"
import {
  formatStockRemaining,
  getMaxCartQuantity,
  isInStock,
} from "@/lib/inventory"
import type { Store } from "@/types/domain"

interface CartDrawerProps {
  store: Store
  showFab?: boolean
}

export function CartDrawer({ store, showFab = true }: CartDrawerProps) {
  const { cartOpen, setCartOpen, items, removeItem, updateQuantity, clearCart, total, itemCount } =
    useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerCity, setCustomerCity] = useState("")
  const [showOptionalDetails, setShowOptionalDetails] = useState(false)
  const createOrder = useCreateOrder(store.id)
  const isWhatsAppMode = store.orderMode === "whatsapp"

  const phoneValid = customerPhone ? isValidPhoneNumber(customerPhone) : false

  function buildWhatsAppMessage(
    orderItems: {
      name: string
      displayName?: string
      price: string
      quantity: number
      productSlug: string
      selections?: Parameters<typeof formatSelectionsLabel>[0]
    }[]
  ) {
    return [
      `*New Order for ${store.name}*`,
      ``,
      `Customer: ${customerName}`,
      `Phone: ${customerPhone}`,
      ``,
      `*Items:*`,
      ...orderItems.map((item) => {
        const label = item.displayName ?? item.name
        const productUrl = absoluteUrl(getProductPath(store.slug, item.productSlug))
        return [
          `- ${label} x${item.quantity} @ ${formatMoney(item.price, store.currency)}`,
          `  ${productUrl}`,
        ].join("\n")
      }),
      ``,
      `*Total:* ${formatMoney(total, store.currency)}`,
    ].join("\n")
  }

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

    await createOrder.mutateAsync({
      body: {
        storeId: store.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        customerAddress: customerAddress || undefined,
        customerCity: customerCity || undefined,
        items: orderItems,
        source: isWhatsAppMode ? "whatsapp" : "checkout",
      },
    })

    if (isWhatsAppMode && store.whatsappNumber) {
      const phone = store.whatsappNumber.replace(/\D/g, "")
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(orderItems))}`,
        "_blank"
      )
      toast.success("Order saved — finish sending in WhatsApp")
    } else {
      toast.success("Order placed")
    }

    clearCart()
    setCartOpen(false)
    setCustomerName("")
    setCustomerPhone("")
    setCustomerEmail("")
    setCustomerAddress("")
    setCustomerCity("")
    setShowOptionalDetails(false)
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
        className="border-0 shadow-lg"
      >
        <ModalHeader
          className="border-0"
          onClose={() => setCartOpen(false)}
        >
          <ModalTitle>Your Cart ({itemCount})</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ModalForm className="space-y-4">
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
                defaultCountry="US"
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
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-2">
                  <ReceiptIcon className="size-4 text-muted-foreground" />
                  Total
                </span>
                <span className="text-lg tabular-nums whitespace-nowrap">
                  {formatMoney(total, store.currency)}
                </span>
              </div>
            </div>
          )}
          </ModalForm>
        </ModalBody>
        {items.length > 0 && (
          <ModalFooter className="border-0">
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
