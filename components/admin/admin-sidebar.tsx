"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  LayoutDashboardIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon,
  EyeIcon,
} from "lucide-react"
import { AppLogo } from "@/components/brand/app-logo"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin", icon: LayoutDashboardIcon, key: "overview" as const },
  { href: "/admin/withdrawals", icon: WalletIcon, key: "withdrawals" as const },
  { href: "/admin/users", icon: UsersIcon, key: "users" as const },
  { href: "/admin/stores", icon: StoreIcon, key: "stores" as const },
  { href: "/admin/visitors", icon: EyeIcon, key: "visitors" as const },
  { href: "/admin/settings", icon: SettingsIcon, key: "settings" as const },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations("admin")
  const normalizedPath = pathname.replace(/^\/(en|fr)/, "") || pathname

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-4">
        <AppLogo size="sm" href="/dashboard" />
        <p className="mt-2 text-xs text-muted-foreground">{t("title")}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ href, icon: Icon, key }) => {
          const active =
            normalizedPath === href ||
            (href !== "/admin" && normalizedPath.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {t(key)}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Merchant dashboard
        </Link>
      </div>
    </aside>
  )
}
