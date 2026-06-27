import { NextIntlClientProvider } from "next-intl"
import { resolveLocale } from "@/lib/i18n/resolve-locale"
import { Providers } from "../providers"

export default async function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await resolveLocale()
  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  )
}
