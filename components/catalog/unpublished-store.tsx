import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export async function UnpublishedStorePage({ storeName }: { storeName: string }) {
  const t = await getTranslations("catalog")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{storeName}</h1>
      <p className="max-w-md text-muted-foreground">{t("unpublishedMessage")}</p>
      <Button variant="outline" asChild>
        <Link href="/">{t("goHome")}</Link>
      </Button>
    </div>
  )
}
