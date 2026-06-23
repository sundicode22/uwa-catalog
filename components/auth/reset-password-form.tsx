"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AuthCard } from "./auth-card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
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

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  })

  if (!token || !email) {
    return (
      <AuthCard
        title="Invalid reset link"
        description="This password reset link is missing required information."
      >
        <Link href="/forgot-password">
          <Button className="h-10 w-full">Request a new link</Button>
        </Link>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        description="Your password has been reset. You can now log in with your new password."
      >
        <Link href="/login">
          <Button className="h-10 w-full">Go to login</Button>
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
          : "Failed to reset password. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard title="Reset password" description="Enter your new password below.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <FormInput
                    type="password"
                    placeholder="Enter a new password"
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
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <FormInput
                    type="password"
                    placeholder="Confirm your new password"
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
            {isLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          Back to login
        </Link>
      </p>
    </AuthCard>
  )
}
