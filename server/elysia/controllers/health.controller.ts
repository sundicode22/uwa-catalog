import { success } from "@/server/lib/response"

export const healthController = {
  check() {
    return success({ status: "ok" })
  },
}
