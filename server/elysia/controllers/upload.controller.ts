import { success } from "@/server/lib/response"
import { uploadService } from "@/server/services/upload.service"
import { requireAuth } from "../plugins/auth"

export const uploadController = {
  async uploadImage(userId: string | null, file: File, folder?: string) {
    requireAuth(userId)
    const result = await uploadService.uploadImage(file, folder)
    return success(result)
  },
}
