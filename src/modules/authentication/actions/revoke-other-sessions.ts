"use server"

import { authService } from "@/modules/authentication/services/auth.service"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function revokeOtherSessionsAction(): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    return authService.revokeOtherSessions(await getAuthRequestContext())
  })
}
