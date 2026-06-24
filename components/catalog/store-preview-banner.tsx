import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StorePreviewBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-b border-border bg-muted/80 px-4 py-3 text-sm backdrop-blur-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link href="/dashboard">
          <ChevronLeftIcon className="size-4" />
          Back to dashboard
        </Link>
      </Button>
      <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
      <span className="text-muted-foreground">
        Preview mode — this catalog is not published yet.
      </span>
      <Button variant="link" className="h-auto p-0 text-sm" asChild>
        <Link href="/dashboard/settings">Publish in settings</Link>
      </Button>
    </div>
  )
}
