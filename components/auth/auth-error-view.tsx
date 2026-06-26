"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { AlertCircleIcon, ChevronLeftIcon } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { getAuthErrorContent } from "@/lib/auth/errors"

export function AuthErrorView() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const { code, showSignup } = getAuthErrorContent(error)
  const t = useTranslations("auth")
  const tErrors = useTranslations("auth.errors")

  return (
    <AuthCard
      title={tErrors(`${code}.title`)}
      description={tErrors(`${code}.description`)}
    >
      <div className="space-y-5">
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircleIcon className="size-6" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="h-10 w-full">
            <Link href="/login">
              <ChevronLeftIcon className="size-4" />
              {t("backToLogin")}
            </Link>
          </Button>
          {showSignup ? (
            <Button asChild variant="outline" className="h-10 w-full">
              <Link href="/signup">{t("createAccount")}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </AuthCard>
  )
}
