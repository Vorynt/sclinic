"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { acceptInvitationSchema } from "@/modules/users/schemas/invitation.schema"
import { invitationService } from "@/modules/users/services/invitation.service"
import type { ClinicMember } from "@/modules/users/types/member"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function acceptInvitationAction(
  data: unknown,
): Promise<ApiResponse<ClinicMember>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(acceptInvitationSchema, data)
    return invitationService.accept(parsed, await getAuthRequestContext())
  })
}
