"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { ClinicMember } from "@/modules/users/types/member"
import { updateMemberStatusSchema } from "@/modules/users/schemas/member.schema"
import { memberService } from "@/modules/users/services/member.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updateMemberStatusAction(
  data: unknown,
): Promise<ApiResponse<ClinicMember>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(updateMemberStatusSchema, data)
    return memberService.setStatus(
      parsed.membershipId,
      parsed.status,
      await getAuthRequestContext(),
    )
  })
}
