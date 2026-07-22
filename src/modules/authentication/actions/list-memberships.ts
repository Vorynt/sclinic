"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { AuthMembership } from "@/modules/authentication/types/auth"
import { authService } from "@/modules/authentication/services/auth.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listMembershipsAction(): Promise<
  ApiResponse<AuthMembership[]>
> {
  return toActionResult(async () => {
    return authService.listMemberships(await getAuthRequestContext())
  })
}
