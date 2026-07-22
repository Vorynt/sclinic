"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function signOutAction(): Promise<ApiResponse<null>> {
  return toActionResult(async () => {
    await authService.signOut(await getAuthRequestContext())
    return null
  })
}
