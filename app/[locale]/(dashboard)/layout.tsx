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
import { DASHBOARD_CANVAS_BG } from "@/lib/dashboard-ui"
import { buildPrivateMetadata } from "@/lib/seo/metadata"
import { cn } from "@/lib/utils"

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
          <SidebarInset className={cn(DASHBOARD_CANVAS_BG)}>
            <DashboardHeader />
            <div className="flex flex-1 flex-col gap-5 p-4 pt-5 sm:p-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </StoreProvider>
    </TooltipProvider>
  )
}
