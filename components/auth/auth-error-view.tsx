"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { getAuthErrorContent } from "@/lib/auth/errors"

export function AuthErrorView() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const { title, description, showSignup } = getAuthErrorContent(error)

  return (
    <AuthCard title={title} description={description}>
      <div className="space-y-5">
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircleIcon className="size-6" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="h-10 w-full">
            <Link href="/login">
              <ArrowLeftIcon className="size-4" />
              Back to login
            </Link>
          </Button>
          {showSignup ? (
            <Button asChild variant="outline" className="h-10 w-full">
              <Link href="/signup">Create an account</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </AuthCard>
  )
}
