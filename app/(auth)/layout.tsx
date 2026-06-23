import type { Metadata } from "next"
import { buildPrivateMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildPrivateMetadata("Account")

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, oklch(0.95 0 0 / 50%) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.95 0 0 / 50%) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "oklch(0.97 0 0)",
      }}
    >
      {children}
    </div>
  )
}
