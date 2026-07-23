"use server"

import type { InviteAccessTokenDto } from "@/modules/users/dto/invitation.dto"
import { inviteAccessTokenSchema } from "@/modules/users/schemas/invitation.schema"
import { invitationService } from "@/modules/users/services/invitation.service"
import type { InviteAccess } from "@/modules/users/types/invitation"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getInviteAccessAction(
  data: InviteAccessTokenDto,
): Promise<ApiResponse<InviteAccess>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(inviteAccessTokenSchema, data)
    return invitationService.getInviteAccess(parsed.token)
  })
}
