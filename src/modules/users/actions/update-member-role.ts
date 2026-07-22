"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { updateMemberRoleSchema } from "@/modules/users/schemas/member.schema"
import { memberService } from "@/modules/users/services/member.service"
import type { ClinicMember } from "@/modules/users/types/member"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updateMemberRoleAction(
  data: unknown,
): Promise<ApiResponse<ClinicMember>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(updateMemberRoleSchema, data)
    return memberService.updateRole(parsed, await getAuthRequestContext())
  })
}
