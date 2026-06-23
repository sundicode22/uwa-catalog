import Link from "next/link"
import { Button } from "@/components/ui/button"

export function UnpublishedStorePage({ storeName }: { storeName: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{storeName}</h1>
      <p className="max-w-md text-muted-foreground">
        This catalog is not live yet. Check back soon or contact the store owner.
      </p>
      <Button variant="outline" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
