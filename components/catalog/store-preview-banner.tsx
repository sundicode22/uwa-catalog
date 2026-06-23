import Link from "next/link"
import { Button } from "@/components/ui/button"

export function StorePreviewBanner() {
  return (
    <div className="border-b border-border bg-muted px-4 py-3 text-center text-sm">
      <span className="text-muted-foreground">
        Preview mode — this catalog is not published yet.
      </span>{" "}
      <Button variant="link" className="h-auto p-0 text-sm" asChild>
        <Link href="/dashboard/settings">Publish in settings</Link>
      </Button>
    </div>
  )
}
