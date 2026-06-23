export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_IMAGE_SIZE_LABEL = "5 MB"

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Only image files are allowed"
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_LABEL} (this file is ${formatFileSize(file.size)})`
  }
  return null
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
