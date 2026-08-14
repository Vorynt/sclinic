"use server"

import { revokeSessionSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function revokeSessionAction(
  data: unknown,
): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(revokeSessionSchema, data)
    return authService.revokeSession(parsed, await getAuthRequestContext())
  })
}
