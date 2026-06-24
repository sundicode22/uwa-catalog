"use client"

import Link from "next/link"
import { ShoppingBagIcon } from "lucide-react"
import { CatalogSearch } from "@/components/catalog/catalog-search"
import { useCart } from "@/components/catalog/cart-context"
import { whatsAppUrl } from "@/lib/whatsapp"
import type { StoreWithCategories } from "@/types/domain"

export function StorefrontHeader({ store }: { store: StoreWithCategories }) {
  const { itemCount, setCartOpen } = useCart()

  return (
    <header className="sticky top-0 z-30 bg-[#f5f2ed]">
      <nav className="border-b border-foreground bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-xs tracking-[0.2em] uppercase">
          <Link href={`/c/${store.slug}#vision`} className="hover:opacity-80">
            About
          </Link>
          <Link href={`/c/${store.slug}#shop`} className="hover:opacity-80">
            Shop All
          </Link>
          {store.categories.map((category) => (
            <Link
              key={category.id}
              href={`/c/${store.slug}?category=${category.slug}#shop`}
              className="hover:opacity-80"
            >
              {category.name}
            </Link>
          ))}
          {store.whatsappNumber ? (
            <a
              href={
                whatsAppUrl(store.whatsappNumber, `Hi ${store.name}, I have a question about your catalog.`) ??
                "#"
              }
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
            >
              Contact
            </a>
          ) : null}
        </div>
      </nav>

      <div className="border-b border-foreground/15">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-5">
          <Link
            href="/login"
            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            Log In
          </Link>

          <Link
            href={`/c/${store.slug}`}
            className="text-center text-2xl font-semibold tracking-[0.35em] uppercase"
          >
            {store.name}
          </Link>

          <div className="flex items-center justify-end gap-3">
            <CatalogSearch
              storeSlug={store.slug}
              className="hidden max-w-xs sm:block"
              inputClassName="rounded-full bg-white"
            />
            <button
              type="button"
              aria-label="Open cart"
              className="relative flex size-10 items-center justify-center border border-foreground/20 bg-white transition-colors hover:border-foreground"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBagIcon className="size-4" />
              {itemCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center bg-foreground text-[10px] text-background">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 sm:hidden">
          <CatalogSearch storeSlug={store.slug} inputClassName="rounded-full bg-white" />
        </div>
      </div>
    </header>
  )
}
