import Link from "next/link"
import { getSiteName } from "@/lib/seo/site"
import { LANDING_NAV } from "@/lib/landing/content"

export function LandingFooter() {
  const siteName = getSiteName()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-brand-gradient-sidebar">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                {siteName.slice(0, 1)}
              </span>
              {siteName}
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Create beautiful product catalogs, manage inventory, and accept orders
              — including WhatsApp checkout — without building a full store from scratch.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {LANDING_NAV.product.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {LANDING_NAV.company.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {LANDING_NAV.legal.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-sm font-semibold">Account</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-foreground">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteName}. All rights reserved.
          </p>
          <p>Made for modern catalog sellers.</p>
        </div>
      </div>
    </footer>
  )
}
