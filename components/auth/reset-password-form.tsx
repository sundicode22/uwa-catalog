"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { BackLink } from "@/components/ui/back-link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "@/i18n/navigation"
import { AuthCard } from "./auth-card"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { apiPost } from "@/lib/api/request"
import { ApiClientError } from "@/types/api"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function ResetPasswordForm() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const schema = z
    .object({
      password: z.string().min(8, t("passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  })

  if (!token || !email) {
    return (
      <AuthCard
        title={t("invalidResetLink")}
        description={t("invalidResetLinkDescription")}
      >
        <Link href="/forgot-password">
          <Button className="h-10 w-full">{t("requestNewLink")}</Button>
        </Link>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard
        title={t("passwordUpdated")}
        description={t("passwordUpdatedDescription")}
      >
        <Link href="/login">
          <Button className="h-10 w-full">{t("goToLogin")}</Button>
        </Link>
      </AuthCard>
    )
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    if (!token || !email) return

    setIsLoading(true)
    setError(null)

    try {
      await apiPost("POST /auth/reset-password", {
        body: {
          email,
          token,
          password: values.password,
        },
      })
      setDone(true)
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : t("resetFailed")
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard title={t("resetPassword")} description={t("resetPasswordDescription")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("newPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t("newPasswordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmNewPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t("confirmNewPasswordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="h-10 w-full"
            disabled={!form.formState.isValid || isLoading}
          >
            {isLoading ? t("updating") : t("updatePassword")}
          </Button>
        </form>
      </Form>

      <div className="mt-4 flex justify-center">
        <BackLink href="/login">{t("backToLogin")}</BackLink>
      </div>
    </AuthCard>
  )
}
