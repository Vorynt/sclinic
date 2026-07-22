"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { removeMemberSchema } from "@/modules/users/schemas/member.schema"
import { memberService } from "@/modules/users/services/member.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function removeMemberAction(
  data: unknown,
): Promise<ApiResponse<null>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(removeMemberSchema, data)
    await memberService.remove(parsed.membershipId, await getAuthRequestContext())
    return null
  })
}
