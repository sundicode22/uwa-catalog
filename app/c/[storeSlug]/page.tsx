import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { CatalogShell } from "@/components/catalog/catalog-shell"
import { CatalogPageClient } from "@/components/catalog/catalog-page-client"
import { PremiumCatalog } from "@/components/catalog/premium-catalog"
import { StorePreviewBanner } from "@/components/catalog/store-preview-banner"
import { UnpublishedStorePage } from "@/components/catalog/unpublished-store"
import { JsonLd } from "@/components/seo/json-ld"
import { getStoreBySlug } from "@/lib/catalog/get-store-by-slug"
import { buildStoreJsonLd } from "@/lib/seo/json-ld"
import { buildStoreMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string }>
}): Promise<Metadata> {
  const { storeSlug } = await params
  const store = await getStoreBySlug(storeSlug)
  if (!store) return {}

  return buildStoreMetadata({
    storeName: store.name,
    storeSlug: store.slug,
    description: store.description,
    coverImageUrl: store.coverImageUrl,
    logoUrl: store.logoUrl,
    isPublished: store.isPublished,
  })
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>
}) {
  const { storeSlug } = await params
  const store = await getStoreBySlug(storeSlug)
  if (!store) notFound()

  let isOwner = false
  if (!store.isPublished) {
    const session = await auth()
    isOwner = session?.user?.id === store.ownerId
  }

  if (!store.isPublished && !isOwner) {
    return <UnpublishedStorePage storeName={store.name} />
  }

  const isPremium = store.storefrontTier === "premium"

  return (
    <>
      {store.isPublished ? (
        <JsonLd
          data={buildStoreJsonLd({
            storeName: store.name,
            storeSlug: store.slug,
            description: store.description,
            coverImageUrl: store.coverImageUrl,
            logoUrl: store.logoUrl,
          })}
        />
      ) : null}
      <CatalogShell store={store} premium={isPremium}>
        {!store.isPublished && isOwner ? <StorePreviewBanner /> : null}
        <Suspense>
          {isPremium ? (
            <PremiumCatalog store={store} />
          ) : (
            <CatalogPageClient store={store} />
          )}
        </Suspense>
      </CatalogShell>
    </>
  )
}
