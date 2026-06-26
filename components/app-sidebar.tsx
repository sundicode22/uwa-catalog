"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
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

const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
    items: [],
  },
  {
    title: "Stores",
    url: "/dashboard/stores",
    icon: <StoreIcon />,
    items: [],
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: <PackageIcon />,
    items: [],
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: <FolderTreeIcon />,
    items: [],
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: <ShoppingCartIcon />,
    items: [],
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: <UsersIcon />,
    items: [],
  },
  {
    title: "Transactions",
    url: "/dashboard/transactions",
    icon: <ReceiptIcon />,
    items: [],
  },
  {
    title: "Share",
    url: "/dashboard/share",
    icon: <QrCodeIcon />,
    items: [],
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: <CreditCardIcon />,
    items: [],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <SettingsIcon />,
    items: [],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

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
            name: session?.user?.name ?? "User",
            email: session?.user?.email ?? "",
            avatar: session?.user?.image ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
