import type { Metadata } from "next"
import { absoluteUrl, getSiteName } from "./site"
import { getProductPath, getStorePath } from "./paths"
import { buildProductDescription, buildStoreDescription } from "./text"

type ProductImage = { url: string; publicId: string }

function buildRobots(indexable: boolean): Metadata["robots"] {
  if (indexable) {
    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    }
  }

  return { index: false, follow: false }
}

function buildOpenGraphImage(url: string, alt: string) {
  return [{ url, width: 1200, height: 630, alt }]
}

export function buildPrivateMetadata(title: string): Metadata {
  return {
    title: { absolute: `${title} | UWA Catalog` },
    robots: buildRobots(false),
  }
}

export function buildStoreMetadata({
  storeName,
  storeSlug,
  description,
  coverImageUrl,
  logoUrl,
  isPublished,
}: {
  storeName: string
  storeSlug: string
  description?: string | null
  coverImageUrl?: string | null
  logoUrl?: string | null
  isPublished: boolean
}): Metadata {
  const title = `${storeName} | Online Catalog`
  const metaDescription = buildStoreDescription(storeName, description)
  const canonical = absoluteUrl(getStorePath(storeSlug))
  const image = coverImageUrl ?? logoUrl ?? undefined

  return {
    title: { absolute: title },
    description: metaDescription,
    alternates: { canonical },
    robots: buildRobots(isPublished),
    openGraph: {
      type: "website",
      url: canonical,
      siteName: getSiteName(),
      title: storeName,
      description: metaDescription,
      ...(image ? { images: buildOpenGraphImage(image, storeName) } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: storeName,
      description: metaDescription,
      ...(image ? { images: [image] } : {}),
    },
    keywords: [storeName, "online catalog", "shop", "products"],
  }
}

export function buildProductMetadata({
  productName,
  productSlug,
  storeName,
  storeSlug,
  description,
  price,
  currency,
  images,
  isPublished,
}: {
  productName: string
  productSlug: string
  storeName: string
  storeSlug: string
  description?: string | null
  price: string
  currency: string
  images: ProductImage[]
  isPublished: boolean
}): Metadata {
  const title = `${productName} | ${storeName}`
  const metaDescription = buildProductDescription(productName, storeName, description)
  const canonical = absoluteUrl(getProductPath(storeSlug, productSlug))
  const primaryImage = images[0]?.url

  return {
    title: { absolute: title },
    description: metaDescription,
    alternates: { canonical },
    robots: buildRobots(isPublished),
    openGraph: {
      type: "website",
      url: canonical,
      siteName: storeName,
      title: productName,
      description: metaDescription,
      ...(primaryImage
        ? { images: buildOpenGraphImage(primaryImage, productName) }
        : {}),
    },
    twitter: {
      card: primaryImage ? "summary_large_image" : "summary",
      title: productName,
      description: metaDescription,
      ...(primaryImage ? { images: [primaryImage] } : {}),
    },
    keywords: [productName, storeName, currency, price, "buy online"],
    other: {
      "product:price:amount": price,
      "product:price:currency": currency,
    },
  }
}
