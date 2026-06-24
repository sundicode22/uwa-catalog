import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <ChevronLeftIcon className="size-4 shrink-0" aria-hidden />
      {children}
    </Link>
  )
}
