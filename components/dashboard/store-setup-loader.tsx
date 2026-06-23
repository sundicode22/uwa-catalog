"use client"

import { useEffect, useState } from "react"
import { StoreIcon } from "lucide-react"
import { getSiteName } from "@/lib/seo/site"
import { cn } from "@/lib/utils"

const MESSAGES = [
  "Loading your stores…",
  "Setting up your workspace…",
  "Preparing your dashboard…",
]

export function StoreSetupLoader() {
  const siteName = getSiteName()
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGES.length)
    }, 2200)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="pointer-events-none absolute -left-20 top-16 size-64 rounded-full bg-primary/15 blur-3xl animate-float"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-12 size-56 rounded-full bg-[oklch(0.7_0.12_40/0.18)] blur-3xl animate-float"
        style={{ animationDelay: "1.2s" }}
        aria-hidden
      />

      <div className="animate-fade-in-up relative flex flex-col items-center text-center">
        <div className="relative flex size-24 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border-2 border-primary/15"
            aria-hidden
          />
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40"
            style={{ animationDuration: "1.1s" }}
            aria-hidden
          />
          <span
            className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-primary/30 border-l-primary/15"
            style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
            aria-hidden
          />
          <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <StoreIcon className="size-7" />
          </div>
        </div>

        <p className="mt-8 text-lg font-semibold tracking-tight">{siteName}</p>
        <p
          key={messageIndex}
          className={cn(
            "mt-2 min-h-5 text-sm text-muted-foreground",
            "animate-fade-in-up"
          )}
        >
          {MESSAGES[messageIndex]}
        </p>

        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          {MESSAGES.map((_, index) => (
            <span
              key={index}
              className={cn(
                "size-1.5 rounded-full transition-all duration-500",
                index === messageIndex
                  ? "w-5 bg-primary"
                  : "bg-primary/25"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
