import { absoluteUrl } from "./site"
import { getProductPath, getStorePath } from "./paths"

type ProductImage = { url: string; publicId: string }

export function buildStoreJsonLd({
  storeName,
  storeSlug,
  description,
  coverImageUrl,
  logoUrl,
}: {
  storeName: string
  storeSlug: string
  description?: string | null
  coverImageUrl?: string | null
  logoUrl?: string | null
}) {
  const url = absoluteUrl(getStorePath(storeSlug))
  const image = coverImageUrl ?? logoUrl ?? undefined

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: storeName,
        description: description ?? undefined,
        publisher: { "@id": `${url}#store` },
      },
      {
        "@type": "Store",
        "@id": `${url}#store`,
        name: storeName,
        url,
        description: description ?? undefined,
        ...(image ? { image } : {}),
        ...(logoUrl ? { logo: logoUrl } : {}),
      },
    ],
  }
}

export function buildProductJsonLd({
  productId,
  productName,
  productSlug,
  description,
  price,
  currency,
  images,
  storeName,
  storeSlug,
  categoryName,
}: {
  productId: string
  productName: string
  productSlug: string
  description?: string | null
  price: string
  currency: string
  images: ProductImage[]
  storeName: string
  storeSlug: string
  categoryName?: string | null
}) {
  const url = absoluteUrl(getProductPath(storeSlug, productSlug))
  const storeUrl = absoluteUrl(getStorePath(storeSlug))

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: storeName,
            item: storeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: productName,
            item: url,
          },
        ],
      },
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: productName,
        description: description ?? undefined,
        sku: productId,
        image: images.map((image) => image.url),
        category: categoryName ?? undefined,
        brand: {
          "@type": "Brand",
          name: storeName,
        },
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: currency,
          price,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: storeName,
          },
        },
      },
    ],
  }
}
