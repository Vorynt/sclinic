"use server"

import { enableTwoFactorSchema } from "@/modules/authentication/schemas/auth.schema"
import { authService } from "@/modules/authentication/services/auth.service"
import type { TwoFactorEnableResult } from "@/modules/authentication/types/auth"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function enableTwoFactorAction(
  data: unknown,
): Promise<ApiResponse<TwoFactorEnableResult>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(enableTwoFactorSchema, data)
    return authService.enableTwoFactor(parsed, await getAuthRequestContext())
  })
}
