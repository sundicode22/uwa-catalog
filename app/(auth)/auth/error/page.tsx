import { Suspense } from "react"
import type { Metadata } from "next"
import { AuthErrorView } from "@/components/auth/auth-error-view"
import { buildPrivateMetadata } from "@/lib/seo/metadata"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = buildPrivateMetadata("Sign-in error")

function AuthErrorFallback() {
  return (
    <div className="w-full max-w-md space-y-4 rounded-xl bg-card p-6 shadow-sm">
      <Skeleton className="mx-auto size-12 rounded-full" />
      <Skeleton className="mx-auto h-6 w-48" />
      <Skeleton className="mx-auto h-4 w-full max-w-sm" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorView />
    </Suspense>
  )
}
