"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"
import { BackLink } from "@/components/ui/back-link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { apiPost } from "@/lib/api/request"
import { ApiClientError } from "@/types/api"
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

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
})

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          : "Failed to send reset link. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description="If an account exists, we've sent password reset instructions."
      >
        <Button asChild className="h-10 w-full">
          <Link href="/login">
            <ChevronLeftIcon className="size-4" />
            Back to login
          </Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot password" description="Enter your email to reset your password.">
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="h-10 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex justify-center">
        <BackLink href="/login">Back to login</BackLink>
      </div>
    </AuthCard>
  )
}
