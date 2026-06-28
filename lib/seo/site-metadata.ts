import type { Metadata } from "next"
import { routing } from "@/i18n/routing"
import { absoluteUrl, getSiteName, getSiteUrl } from "./site"

const SITE_KEYWORDS = [
  "product catalog",
  "online storefront",
  "WhatsApp orders",
  "inventory management",
  "catalog maker",
  "small business selling",
  "shareable catalog",
  "mobile commerce",
] as const

export const DEFAULT_SITE_DESCRIPTION =
  "Publish beautiful product catalogs in minutes. Manage inventory, accept orders with WhatsApp checkout, and share a branded storefront link — no custom website needed."

type BuildSiteMetadataInput = {
  siteName?: string
  title: string
  description: string
  keywords?: string[]
  locale?: string
  path?: string
}

function localeToOpenGraph(locale: string) {
  return locale === "fr" ? "fr_FR" : "en_US"
}

function buildLocaleAlternates(path = "/") {
  const normalizedPath = path === "/" ? "" : path
  return Object.fromEntries(
    routing.locales.map((loc) => [
      loc,
      loc === routing.defaultLocale
        ? absoluteUrl(normalizedPath || "/")
        : absoluteUrl(`/${loc}${normalizedPath}`),
    ])
  )
}

function buildCanonical(locale: string, path = "/") {
  const normalizedPath = path === "/" ? "" : path
  if (locale === routing.defaultLocale) {
    return absoluteUrl(normalizedPath || "/")
  }
  return absoluteUrl(`/${locale}${normalizedPath}`)
}

export function buildSiteMetadata({
  siteName = getSiteName(),
  title,
  description,
  keywords = [...SITE_KEYWORDS],
  locale = routing.defaultLocale,
  path = "/",
}: BuildSiteMetadataInput): Metadata {
  const canonical = buildCanonical(locale, path)
  const alternateLocales = routing.locales
    .filter((loc) => loc !== locale)
    .map(localeToOpenGraph)

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    applicationName: siteName,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    category: "business",
    alternates: {
      canonical,
      languages: buildLocaleAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: localeToOpenGraph(locale),
      alternateLocale: alternateLocales,
      url: canonical,
      siteName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export function getDefaultSiteMetadata(): Metadata {
  const siteName = getSiteName()
  return buildSiteMetadata({
    siteName,
    title: `${siteName} — Online Product Catalogs for Modern Sellers`,
    description: DEFAULT_SITE_DESCRIPTION,
  })
}
