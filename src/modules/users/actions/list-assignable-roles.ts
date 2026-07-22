"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { invitationService } from "@/modules/users/services/invitation.service"
import type { AssignableRole } from "@/modules/users/types/invitation"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listAssignableRolesAction(): Promise<
  ApiResponse<AssignableRole[]>
> {
  return toActionResult(async () =>
    invitationService.listAssignableRoles(await getAuthRequestContext()),
  )
}
