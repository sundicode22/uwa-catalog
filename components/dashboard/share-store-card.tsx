"use client"

import Image from "next/image"
import { CopyIcon, DownloadIcon, Share2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { copyStoreLink, getStoreUrl, shareStoreLink } from "@/lib/store-url"
import type { Store } from "@/types/domain"

function getQrImageUrl(storeUrl: string, size = 512) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(storeUrl)}`
}

async function downloadQrCode(store: Store, storeUrl: string) {
  try {
    const qrUrl = getQrImageUrl(storeUrl, 512)
    const response = await fetch(qrUrl)
    if (!response.ok) throw new Error("Failed to fetch QR code")

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = `${store.slug}-qr-code.png`
    link.click()
    URL.revokeObjectURL(objectUrl)
    toast.success("QR code downloaded")
  } catch {
    toast.error("Could not download QR code. Try again.")
  }
}

export function ShareStoreCard({ store }: { store: Store }) {
  const storeUrl = getStoreUrl(store.slug)
  const qrPreviewUrl = getQrImageUrl(storeUrl, 220)

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Share your store</CardTitle>
        <CardDescription>
          Download your QR code, copy your catalog link, or share directly to WhatsApp and social.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="mx-auto shrink-0 rounded-lg border border-border bg-white p-4 lg:mx-0">
          <Image
            src={qrPreviewUrl}
            alt={`QR code for ${store.name}`}
            width={200}
            height={200}
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-sm font-medium">Store link</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{storeUrl}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="gap-2"
              onClick={() => downloadQrCode(store, storeUrl)}
            >
              <DownloadIcon className="size-4" />
              Download QR code
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => copyStoreLink(storeUrl)}
            >
              <CopyIcon className="size-4" />
              Copy link
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => shareStoreLink(store, storeUrl)}
            >
              <Share2Icon className="size-4" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
