"use client"

import { Fragment } from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const DASHBOARD_SECTIONS = [
  { path: "/dashboard/stores", labelKey: "stores" },
  { path: "/dashboard/products", labelKey: "products" },
  { path: "/dashboard/categories", labelKey: "categories" },
  { path: "/dashboard/orders", labelKey: "orders" },
  { path: "/dashboard/customers", labelKey: "customers" },
  { path: "/dashboard/transactions", labelKey: "transactions" },
  { path: "/dashboard/share", labelKey: "share" },
  { path: "/dashboard/billing", labelKey: "billing" },
  { path: "/dashboard/settings", labelKey: "settings" },
] as const

type NavLabelKey =
  | "dashboard"
  | (typeof DASHBOARD_SECTIONS)[number]["labelKey"]

function getBreadcrumbItems(pathname: string) {
  if (pathname === "/dashboard") {
    return [{ href: "/dashboard" as const, labelKey: "overview" as const, isCurrent: true }]
  }

  const section = DASHBOARD_SECTIONS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  )

  if (!section) {
    return [{ href: "/dashboard" as const, labelKey: "dashboard" as const, isCurrent: true }]
  }

  return [
    { href: "/dashboard" as const, labelKey: "dashboard" as const, isCurrent: false },
    { href: section.path, labelKey: section.labelKey, isCurrent: true },
  ]
}

export function DashboardHeader() {
  const tNav = useTranslations("nav")
  const pathname = usePathname()
  const items = getBreadcrumbItems(pathname)

  function labelFor(key: NavLabelKey | "overview") {
    return tNav(key)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            {items.map((item, index) => (
              <Fragment key={item.href}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {item.isCurrent ? (
                    <BreadcrumbPage>{labelFor(item.labelKey)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{labelFor(item.labelKey)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="px-4">
        <LocaleSwitcher className="h-9 w-[7.5rem]" />
      </div>
    </header>
  )
}
