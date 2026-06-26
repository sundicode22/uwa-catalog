import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { AppLogo } from "@/components/brand/app-logo"
import { getSiteName } from "@/lib/seo/site"

export async function LandingFooter() {
  const t = await getTranslations("landing")
  const tNav = await getTranslations("nav")
  const siteName = getSiteName()
  const year = new Date().getFullYear()

  const productLinks = [
    { label: tNav("features"), href: "#features" },
    { label: tNav("howItWorks"), href: "#how-it-works" },
    { label: tNav("pricing"), href: "#pricing" },
    { label: tNav("testimonials"), href: "#testimonials" },
    { label: tNav("faq"), href: "#faq" },
  ]

  const companyLinks = [
    { label: t("about"), href: "#" },
    { label: t("blog"), href: "#" },
    { label: t("contact"), href: "#" },
  ]

  const legalLinks = [
    { label: t("privacy"), href: "#" },
    { label: t("terms"), href: "#" },
  ]

  return (
    <footer className="w-full border-t border-border bg-brand-gradient-sidebar">
      <div className="w-full px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <AppLogo size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footerDescription")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("footerProduct")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("footerCompany")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t("footerLegal")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-sm font-semibold">{t("footerAccount")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  {tNav("login")}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-foreground">
                  {tNav("signup")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  {tNav("dashboard")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>{t("allRightsReserved", { year, appName: siteName })}</p>
          <p>{t("madeForSellers")}</p>
        </div>
      </div>
    </footer>
  )
}
