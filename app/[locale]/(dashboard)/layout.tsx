import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StoreProvider } from "@/components/providers/store-provider"
import { buildPrivateMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return buildPrivateMetadata(t("dashboard"))
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <StoreProvider>
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset className="bg-gray-50">
            <DashboardHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </StoreProvider>
    </TooltipProvider>
  )
}
