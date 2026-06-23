import { success } from "@/server/lib/response"
import { authService } from "@/server/services/auth.service"
import type {
  ForgotPasswordInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/domain"

export const authController = {
  async register(body: RegisterInput) {
    const user = await authService.register(body)
    return success(user)
  },

  async forgotPassword(body: ForgotPasswordInput) {
    const result = await authService.requestPasswordReset(body)
    return success(result)
  },

  async resetPassword(body: ResetPasswordInput) {
    const result = await authService.resetPassword(body)
    return success(result)
  },
}
