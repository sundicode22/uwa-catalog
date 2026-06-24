import type { Metadata } from "next"
import { AppLogo } from "@/components/brand/app-logo"
import { buildPrivateMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildPrivateMetadata("Account")

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 p-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, oklch(0.95 0 0 / 50%) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.95 0 0 / 50%) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "oklch(0.97 0 0)",
      }}
    >
      <AppLogo size="lg" href="/" />
      <div className="flex w-full justify-center">{children}</div>
    </div>
  )
}
