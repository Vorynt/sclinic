"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { resetPasswordSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function resetPasswordAction(
  data: unknown,
): Promise<ApiResponse<null>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(resetPasswordSchema, data)
    await authService.resetPassword(parsed, await getAuthRequestContext())
    return null
  })
}
