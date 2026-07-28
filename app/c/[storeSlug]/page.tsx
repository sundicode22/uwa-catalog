import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { BlockedStorePage } from "@/components/catalog/blocked-store"
import { CatalogShell } from "@/components/catalog/catalog-shell"
import { CatalogPageClient } from "@/components/catalog/catalog-page-client"
import { PremiumCatalog } from "@/components/catalog/premium-catalog"
import { StorePreviewBanner } from "@/components/catalog/store-preview-banner"
import { UnpublishedStorePage } from "@/components/catalog/unpublished-store"
import { JsonLd } from "@/components/seo/json-ld"
import { getStoreBySlug } from "@/lib/catalog/get-store-by-slug"
import { buildStoreJsonLd } from "@/lib/seo/json-ld"
import { buildStoreMetadata } from "@/lib/seo/metadata"
import { getCatalogPlanAccess } from "@/server/services/catalog-access.service"

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

  const session = await auth()
  const isOwner = session?.user?.id === store.ownerId

  if (!store.isPublished && !isOwner) {
    return <UnpublishedStorePage storeName={store.name} />
  }

  const access = await getCatalogPlanAccess(store.id, store.ownerId)
  if (!access.storeAllowed && !isOwner) {
    return <BlockedStorePage storeName={store.name} />
  }

  const isPremium =
    store.storefrontTier === "premium" && access.canUsePremiumStorefront

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
        {!access.storeAllowed && isOwner ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
            This store exceeds your plan limit and is hidden from customers. Renew or upgrade to unblock it.
          </div>
        ) : null}
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
