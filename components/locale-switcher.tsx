"use client"

import { useLocale } from "next-intl"
import { useRouter as useNextRouter } from "next/navigation"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LocaleSwitcherProps {
  className?: string
  /** When true, sets NEXT_LOCALE cookie for storefront routes outside [locale]. */
  useCookie?: boolean
}

export function LocaleSwitcher({ className, useCookie = false }: LocaleSwitcherProps) {
  const t = useTranslations("common")
  const locale = useLocale() as Locale
  const router = useRouter()
  const nextRouter = useNextRouter()
  const pathname = usePathname()

  function onChange(nextLocale: string) {
    if (useCookie) {
      document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;samesite=lax`
      nextRouter.refresh()
      return
    }
    router.replace(pathname, { locale: nextLocale as Locale })
  }

  return (
    <Select value={locale} onValueChange={onChange}>
      <SelectTrigger className={className} aria-label={t("language")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {loc === "en" ? t("english") : t("french")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
