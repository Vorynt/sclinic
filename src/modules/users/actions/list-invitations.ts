"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { invitationService } from "@/modules/users/services/invitation.service"
import type { ClinicInvitation } from "@/modules/users/types/invitation"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listInvitationsAction(): Promise<
  ApiResponse<ClinicInvitation[]>
> {
  return toActionResult(async () =>
    invitationService.listPending(await getAuthRequestContext()),
  )
}
