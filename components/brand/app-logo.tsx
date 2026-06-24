import Link from "next/link"
import { getSiteName } from "@/lib/seo/site"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
} as const

interface AppLogoProps {
  className?: string
  size?: keyof typeof sizeClasses
  asLink?: boolean
  href?: string
}

export function AppLogo({
  className,
  size = "md",
  asLink = true,
  href = "/",
}: AppLogoProps) {
  const name = getSiteName()

  const mark = (
    <span
      className={cn(
        "font-logo font-bold lowercase tracking-tight text-foreground",
        sizeClasses[size],
        className
      )}
    >
      {name}
    </span>
  )

  if (!asLink) return mark

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 transition-opacity hover:opacity-80"
    >
      {mark}
    </Link>
  )
}
