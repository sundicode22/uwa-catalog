import { AppLogo } from "@/components/brand/app-logo"
import { whatsAppUrl } from "@/lib/whatsapp"
import type { StoreWithCategories } from "@/types/domain"

export function StorefrontFooter({ store }: { store: StoreWithCategories }) {
  return (
    <footer className="mt-16 w-full border-t border-foreground">
      <div className="grid w-full gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="space-y-4">
          <p className="font-logo text-3xl font-bold lowercase tracking-tight">
            {store.name}
          </p>
          <p className="max-w-md text-3xl leading-tight font-medium">
            Enhancing your shopping experience
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6 md:items-end md:text-right">
          <div className="space-y-1 text-sm text-foreground/70">
            {store.whatsappNumber ? (
              <a
                href={
                  whatsAppUrl(
                    store.whatsappNumber,
                    `Hi ${store.name}, I have a question about your catalog.`
                  ) ?? "#"
                }
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {store.whatsappNumber}
              </a>
            ) : null}
            {store.description ? <p>{store.description}</p> : null}
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <AppLogo size="sm" asLink={false} />
            <p className="text-xs text-foreground/50">
              © {new Date().getFullYear()} {store.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
