import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"
import { getDefaultSiteMetadata } from "@/lib/seo/site-metadata"
import { routing } from "@/i18n/routing"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const syne = Syne({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = getDefaultSiteMetadata()

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = await headers()
  const locale =
    headerStore.get("x-next-intl-locale") ?? routing.defaultLocale

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
