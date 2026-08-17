"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import type { AuthContext } from "@/shared/auth"
import type { ApiResponse } from "@/types/api"

export async function completeProductTourAction(): Promise<
  ApiResponse<AuthContext>
> {
  return toActionResult(async () => {
    return authService.completeProductTour(await getAuthRequestContext())
  })
}
