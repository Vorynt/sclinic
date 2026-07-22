"use server"

import type { AuthContext } from "@/modules/authentication/types/auth"
import { changePasswordSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function changePasswordAction(
  data: unknown,
): Promise<ApiResponse<AuthContext>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(changePasswordSchema, data)
    return authService.changePassword(parsed, await getAuthRequestContext())
  })
}
