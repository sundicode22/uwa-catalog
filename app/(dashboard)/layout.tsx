import type { Metadata } from "next"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StoreProvider } from "@/components/providers/store-provider"
import { buildPrivateMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildPrivateMetadata("Dashboard")

export default function DashboardLayout({
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
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </StoreProvider>
    </TooltipProvider>
  )
}
