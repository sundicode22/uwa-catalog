"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { UploadIcon, XIcon } from "lucide-react"
import { apiUpload } from "@/lib/api/request"
import { MAX_IMAGE_SIZE_LABEL, validateImageFile } from "@/lib/upload-limits"
import { Button } from "@/components/ui/button"
import type { ProductImage } from "@/types/domain"

interface ImageUploaderProps {
  value: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

export function ImageUploader({
  value,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || value.length >= maxImages) return
    setUploading(true)

    try {
      const newImages: ProductImage[] = []

      for (const file of Array.from(files).slice(0, maxImages - value.length)) {
        const error = validateImageFile(file)
        if (error) {
          toast.error(error)
          continue
        }

        const result = await apiUpload({
          file,
          folder: "uwa-catalog/products",
        })
        newImages.push({ url: result.url, publicId: result.publicId })
      }

      onChange([...value, ...newImages])
      if (newImages.length > 0) {
        toast.success(
          newImages.length === 1
            ? "Image uploaded"
            : `${newImages.length} images uploaded`
        )
      }
    } catch {
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((img, i) => (
          <div key={img.publicId} className="relative size-20 border border-border">
            <Image src={img.url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -top-2 -right-2 flex size-5 items-center justify-center bg-destructive text-destructive-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ))}
      </div>

      {value.length < maxImages && (
        <div className="flex flex-col items-center justify-center border border-dashed border-border p-6">
          <UploadIcon className="mb-2 size-6 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            {uploading ? "Uploading..." : `Upload product images (max ${MAX_IMAGE_SIZE_LABEL} each)`}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </Button>
        </div>
      )}
    </div>
  )
}
