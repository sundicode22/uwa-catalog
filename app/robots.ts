import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/c/",
        disallow: ["/dashboard/", "/login", "/signup", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(""),
  }
}
