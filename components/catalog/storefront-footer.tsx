import type { StoreWithCategories } from "@/types/domain"

export function StorefrontFooter({ store }: { store: StoreWithCategories }) {
  return (
    <footer className="mt-16 border-t border-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-2xl font-semibold tracking-[0.2em] uppercase">
            {store.name}
          </p>
          <p className="max-w-md text-3xl leading-tight font-medium">
            Enhancing your shopping experience
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6 md:items-end md:text-right">
          <div className="space-y-1 text-sm text-foreground/70">
            {store.whatsappNumber ? <p>{store.whatsappNumber}</p> : null}
            {store.description ? <p>{store.description}</p> : null}
          </div>
          <p className="text-xs text-foreground/50">
            © {new Date().getFullYear()} {store.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
