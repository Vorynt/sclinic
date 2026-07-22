"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { AuthContext } from "@/modules/authentication/types/auth"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getSessionAction(): Promise<
  ApiResponse<AuthContext | null>
> {
  return toActionResult(async () => {
    return authService.getSession(await getAuthRequestContext())
  })
}
