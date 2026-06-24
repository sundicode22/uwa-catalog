import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { CatalogShell } from "@/components/catalog/catalog-shell"
import { ProductPageClient } from "@/components/catalog/product-page-client"
import { StorePreviewBanner } from "@/components/catalog/store-preview-banner"
import { UnpublishedStorePage } from "@/components/catalog/unpublished-store"
import { JsonLd } from "@/components/seo/json-ld"
import { getStoreBySlug } from "@/lib/catalog/get-store-by-slug"
import { resolveStoreCurrency } from "@/lib/currency"
import { buildProductJsonLd } from "@/lib/seo/json-ld"
import { buildProductMetadata } from "@/lib/seo/metadata"
import { productOptionsService } from "@/server/services/product-options.service"
import { db, products } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import type { Product } from "@/types/domain"

async function getProductPageData(storeSlug: string, productSlug: string) {
  const store = await getStoreBySlug(storeSlug)
  if (!store) return null

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, store.id), eq(products.slug, productSlug)))

  if (!product || !product.isActive) return null

  let category = null
  if (product.categoryId) {
    category = store.categories.find((c) => c.id === product.categoryId) ?? null
  }

  const counts = await productOptionsService.getCounts([product.id])
  const optionCounts = counts[product.id] ?? {
    sizes: 0,
    variationGroups: 0,
    modifierGroups: 0,
  }

  const serializedProduct: Product = {
    id: product.id,
    storeId: product.storeId,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    currency: product.currency,
    images: product.images ?? [],
    optionCounts,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    inventory: product.inventory,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }

  return {
    store,
    product: serializedProduct,
    category,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>
}): Promise<Metadata> {
  const { storeSlug, productSlug } = await params
  const data = await getProductPageData(storeSlug, productSlug)
  if (!data) return {}

  const currency = resolveStoreCurrency(data.store)

  return buildProductMetadata({
    productName: data.product.name,
    productSlug: data.product.slug,
    storeName: data.store.name,
    storeSlug: data.store.slug,
    description: data.product.description,
    price: data.product.price,
    currency,
    images: data.product.images ?? [],
    isPublished: data.store.isPublished,
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>
}) {
  const { storeSlug, productSlug } = await params
  const data = await getProductPageData(storeSlug, productSlug)
  if (!data) notFound()

  const session = await auth()
  const isOwner = session?.user?.id === data.store.ownerId

  if (!data.store.isPublished && !isOwner) {
    return <UnpublishedStorePage storeName={data.store.name} />
  }

  const isPremium = data.store.storefrontTier === "premium"
  const currency = resolveStoreCurrency(data.store)

  return (
    <>
      {data.store.isPublished ? (
        <JsonLd
          data={buildProductJsonLd({
            productId: data.product.id,
            productName: data.product.name,
            productSlug: data.product.slug,
            description: data.product.description,
            price: data.product.price,
            currency,
            images: data.product.images ?? [],
            storeName: data.store.name,
            storeSlug: data.store.slug,
            categoryName: data.category?.name,
          })}
        />
      ) : null}
      <CatalogShell store={data.store} premium={isPremium}>
        {!data.store.isPublished && isOwner ? <StorePreviewBanner /> : null}
        <ProductPageClient
          store={data.store}
          product={data.product}
          category={data.category}
          premium={isPremium}
        />
      </CatalogShell>
    </>
  )
}
