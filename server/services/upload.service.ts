import { cloudinary } from "@/lib/cloudinary"
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/upload-limits"
import { AppError } from "@/server/elysia/plugins/errors"
import type { UploadResult } from "@/types/domain"

const DEFAULT_FOLDER = "uwa-catalog"

export const uploadService = {
  async uploadImage(file: File, folder = DEFAULT_FOLDER): Promise<UploadResult> {
    if (file.type && !file.type.startsWith("image/")) {
      throw new AppError("INVALID_FILE", "Only image files are allowed")
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new AppError(
        "FILE_TOO_LARGE",
        `Image must be smaller than ${MAX_IMAGE_SIZE_LABEL}`
      )
    }

    const mimeType = file.type || "image/jpeg"
    const bytes = await file.arrayBuffer()
    const base64 = `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`

    try {
      const result = await cloudinary.uploader.upload(base64, { folder })

      return {
        url: result.secure_url,
        publicId: result.public_id,
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cloudinary upload failed"
      throw new AppError("UPLOAD_FAILED", message, 502)
    }
  },
}
