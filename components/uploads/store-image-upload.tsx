"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { UploadIcon, XIcon } from "lucide-react"
import { apiUpload } from "@/lib/api/request"
import { MAX_IMAGE_SIZE_LABEL, validateImageFile } from "@/lib/upload-limits"
import { Button } from "@/components/ui/button"

interface StoreImageUploadProps {
  label: string
  value?: string | null
  onChange: (url: string | null) => void
  folder: string
  aspect?: "square" | "cover"
  variant?: "image" | "logo"
}

export function StoreImageUpload({
  label,
  value,
  onChange,
  folder,
  aspect = "square",
  variant = "image",
}: StoreImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | null) {
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    setUploading(true)

    try {
      const result = await apiUpload({ file, folder })
      onChange(result.url)
      toast.success(`${label} uploaded`)
    } catch {
      toast.error(`Failed to upload ${label.toLowerCase()}`)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const previewClass =
    aspect === "cover" ? "relative h-32 w-full" : "relative size-24"
  const isLogo = variant === "logo"

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        <div
          className={
            isLogo
              ? `${previewClass}`
              : `${previewClass} border border-border`
          }
        >
          <Image
            src={value}
            alt={label}
            fill
            className={isLogo ? "object-contain" : "object-cover"}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 flex size-5 items-center justify-center bg-destructive text-destructive-foreground"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center border border-dashed border-border p-4 ${aspect === "cover" ? "h-32" : "size-24"}`}
        >
          <UploadIcon className="mb-1 size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading..." : `Upload (max ${MAX_IMAGE_SIZE_LABEL})`}
          </Button>
        </div>
      )}
    </div>
  )
}
