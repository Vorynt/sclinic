"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { AuthContext } from "@/modules/authentication/types/auth"
import { signUpSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function signUpAction(
  data: unknown,
): Promise<ApiResponse<AuthContext>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(signUpSchema, data)
    return authService.signUp(parsed, await getAuthRequestContext())
  })
}
