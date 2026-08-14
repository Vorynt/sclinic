"use server"

import { authService } from "@/modules/authentication/services/auth.service"
import type { AuthSessionDevice } from "@/modules/authentication/types/auth"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listSessionsAction(): Promise<
  ApiResponse<AuthSessionDevice[]>
> {
  return toActionResult(async () => {
    return authService.listSessions(await getAuthRequestContext())
  })
}
