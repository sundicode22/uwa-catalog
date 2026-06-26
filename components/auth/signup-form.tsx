"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { apiPost } from "@/lib/api/request"
import { ApiClientError } from "@/types/api"
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

export function SignupForm() {
  const t = useTranslations("auth")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signupSchema = z
    .object({
      name: z.string().min(2, t("nameMinLength")),
      email: z.string().email(t("invalidEmail")),
      password: z.string().min(8, t("passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    })

  type SignupValues = z.infer<typeof signupSchema>

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  })

  async function onSubmit(values: SignupValues) {
    setIsLoading(true)
    setError(null)

    try {
      await apiPost("POST /auth/register", {
        body: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      })
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : t("createAccountFailed")
      )
      setIsLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    setIsLoading(false)
    if (result?.error) {
      setError(t("accountCreatedLoginFailed"))
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <AuthCard title={t("signup")} description={t("signupDescription")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <FormInput placeholder={t("namePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t("createPasswordPlaceholder")}
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
                <FormLabel>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t("confirmPasswordPlaceholder")}
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
            {isLoading ? t("creatingAccount") : t("signUp")}
          </Button>
        </form>
      </Form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">{tCommon("or")}</span>
        <Separator className="flex-1" />
      </div>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("logIn")}
        </Link>
      </p>
    </AuthCard>
  )
}
