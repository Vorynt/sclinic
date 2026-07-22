"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { revokeInvitationSchema } from "@/modules/users/schemas/invitation.schema"
import { invitationService } from "@/modules/users/services/invitation.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function revokeInvitationAction(
  data: unknown,
): Promise<ApiResponse<null>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(revokeInvitationSchema, data)
    await invitationService.revoke(
      parsed.invitationId,
      await getAuthRequestContext(),
    )
    return null
  })
}
