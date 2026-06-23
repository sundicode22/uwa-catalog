"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function OAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full gap-2"
      onClick={() => signIn("google", { callbackUrl })}
    >
      <Image
        src="/google.png"
        alt=""
        width={18}
        height={18}
        className="size-[18px] shrink-0"
      />
      Continue with Google
    </Button>
  )
}
