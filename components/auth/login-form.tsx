"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { Link, useRouter } from "@/i18n/navigation"
import { AuthCard } from "./auth-card"
import { OAuthButtons } from "./oauth-buttons"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { PasswordInput } from "@/components/ui/password-input"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function LoginForm() {
  const t = useTranslations("auth")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  })

  type LoginValues = z.infer<typeof loginSchema>

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  })

  const isValid = form.formState.isValid

  async function onSubmit(values: LoginValues) {
    setIsLoading(true)
    setApiError(null)
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    setIsLoading(false)

    if (result?.error) {
      setApiError(t("accountNotFound"))
      form.setError("email", { message: t("accountNotFound") })
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <AuthCard title={t("login")} description={t("loginDescription")}>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("password")}</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder={t("passwordPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {apiError && (
            <p className="text-sm text-destructive">{apiError}</p>
          )}

          <Button
            type="submit"
            className="h-10 w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? t("loggingIn") : t("logIn")}
          </Button>
        </form>
      </Form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">{tCommon("or")}</span>
        <Separator className="flex-1" />
      </div>

      <OAuthButtons callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </AuthCard>
  )
}
