import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { hasPlatformAdminRole } from "@/lib/auth/platform-admin-role"
import { buildPrivateMetadata } from "@/lib/seo/metadata"
import { Providers } from "@/app/providers"

export const metadata: Metadata = buildPrivateMetadata("System admin")

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  if (!hasPlatformAdminRole(session.user.email)) {
    redirect("/dashboard")
  }

  return (
    <Providers>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </Providers>
  )
}
