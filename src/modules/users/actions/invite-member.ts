"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { inviteMemberSchema } from "@/modules/users/schemas/invitation.schema"
import { invitationService } from "@/modules/users/services/invitation.service"
import type { ClinicInvitation } from "@/modules/users/types/invitation"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function inviteMemberAction(
  data: unknown,
): Promise<ApiResponse<ClinicInvitation>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(inviteMemberSchema, data)
    return invitationService.invite(parsed, await getAuthRequestContext())
  })
}
