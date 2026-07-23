"use server"

import type { AuthContext } from "@/modules/authentication/types/auth"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { SetPasswordFromInviteDto } from "@/modules/users/dto/invitation.dto"
import { setPasswordFromInviteSchema } from "@/modules/users/schemas/invitation.schema"
import { invitationService } from "@/modules/users/services/invitation.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function setPasswordFromInviteAction(
  data: SetPasswordFromInviteDto,
): Promise<ApiResponse<AuthContext>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(setPasswordFromInviteSchema, data)
    return invitationService.setPasswordFromInvite(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
