"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { requestPasswordResetSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function requestPasswordResetAction(
  data: unknown,
): Promise<ApiResponse<null>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(requestPasswordResetSchema, data)
    await authService.requestPasswordReset(
      parsed,
      await getAuthRequestContext(),
    )
    return null
  })
}
