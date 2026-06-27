"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import {
  LayoutDashboardIcon,
  PackageIcon,
  FolderTreeIcon,
  ShoppingCartIcon,
  UsersIcon,
  ReceiptIcon,
  SettingsIcon,
  StoreIcon,
  CreditCardIcon,
  QrCodeIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { StoreSwitcher } from "@/components/dashboard/store-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const t = useTranslations("nav")

  const navItems = [
    {
      title: t("overview"),
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      items: [],
    },
    {
      title: t("stores"),
      url: "/dashboard/stores",
      icon: <StoreIcon />,
      items: [],
    },
    {
      title: t("products"),
      url: "/dashboard/products",
      icon: <PackageIcon />,
      items: [],
    },
    {
      title: t("categories"),
      url: "/dashboard/categories",
      icon: <FolderTreeIcon />,
      items: [],
    },
    {
      title: t("orders"),
      url: "/dashboard/orders",
      icon: <ShoppingCartIcon />,
      items: [],
    },
    {
      title: t("customers"),
      url: "/dashboard/customers",
      icon: <UsersIcon />,
      items: [],
    },
    {
      title: t("transactions"),
      url: "/dashboard/transactions",
      icon: <ReceiptIcon />,
      items: [],
    },
    {
      title: t("share"),
      url: "/dashboard/share",
      icon: <QrCodeIcon />,
      items: [],
    },
    {
      title: t("billing"),
      url: "/dashboard/billing",
      icon: <CreditCardIcon />,
      items: [],
    },
    {
      title: t("settings"),
      url: "/dashboard/settings",
      icon: <SettingsIcon />,
      items: [],
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
      {...props}
    >
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name ?? t("user"),
            email: session?.user?.email ?? "",
            avatar: session?.user?.image ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
