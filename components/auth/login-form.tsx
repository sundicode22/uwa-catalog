"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { AuthCard } from "./auth-card"
import { OAuthButtons } from "./oauth-buttons"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      setApiError("No account found with this email. Please sign up.")
      form.setError("email", { message: "No account found with this email. Please sign up." })
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <AuthCard title="Login" description="Enter your details to login.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <FormInput placeholder="Enter your Email" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <FormInput
                    type="password"
                    placeholder="Enter your password"
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
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <OAuthButtons callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}
