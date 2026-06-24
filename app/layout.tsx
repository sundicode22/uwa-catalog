import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { getSiteName, getSiteUrl } from "@/lib/seo/site"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const syne = Syne({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

const siteName = getSiteName()
const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Create and share beautiful product catalogs for your store",
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: siteName,
    description: "Create and share beautiful product catalogs for your store",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: "Create and share beautiful product catalogs for your store",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
