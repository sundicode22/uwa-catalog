"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { apiUpload } from "@/lib/api/request"
import { validateImageFile } from "@/lib/upload-limits"
import { Button } from "@/components/ui/button"
import type { ProductImage } from "@/types/domain"

interface OptionImageUploadProps {
  value: ProductImage | null | undefined
  onChange: (image: ProductImage | null) => void
}

export function OptionImageUpload({ value, onChange }: OptionImageUploadProps) {
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
      const result = await apiUpload({
        file,
        folder: "uwa-catalog/product-options",
      })
      onChange({ url: result.url, publicId: result.publicId })
      toast.success("Option image uploaded")
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      {value?.url ? (
        <div className="relative size-10 overflow-hidden rounded-md border border-border">
          <Image src={value.url} alt="" fill className="object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-0 right-0 size-4 rounded-none"
            onClick={() => onChange(null)}
            aria-label="Remove option image"
          >
            <XIcon className="size-2.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload option image"
        >
          <ImageIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}
