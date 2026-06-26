"use client"

import { useState } from "react"
import { ChevronLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { BackLink } from "@/components/ui/back-link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { apiPost } from "@/lib/api/request"
import { ApiClientError } from "@/types/api"
import { Link } from "@/i18n/navigation"
import { AuthCard } from "./auth-card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function ForgotPasswordForm() {
  const t = useTranslations("auth")
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = z.object({
    email: z.string().email(t("invalidEmail")),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true)
    setError(null)

    try {
      await apiPost("POST /auth/forgot-password", { body: values })
      setSent(true)
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : t("resetLinkFailed")
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthCard
        title={t("checkEmail")}
        description={t("checkEmailDescription")}
      >
        <Button asChild className="h-10 w-full">
          <Link href="/login">
            <ChevronLeftIcon className="size-4" />
            {t("backToLogin")}
          </Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={t("forgotPasswordTitle")} description={t("forgotPasswordDescription")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <FormInput placeholder={t("emailPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={isLoading}
          >
            {isLoading ? t("sending") : t("sendResetLink")}
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex justify-center">
        <BackLink href="/login">{t("backToLogin")}</BackLink>
      </div>
    </AuthCard>
  )
}
