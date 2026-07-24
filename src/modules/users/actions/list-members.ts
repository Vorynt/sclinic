"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listMembersSchema } from "@/modules/users/schemas/member.schema"
import { memberService } from "@/modules/users/services/member.service"
import type { ClinicMember } from "@/modules/users/types/member"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"
import type { PaginatedResult } from "@/types/pagination"

export async function listMembersAction(
  data: unknown = {},
): Promise<ApiResponse<PaginatedResult<ClinicMember>>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listMembersSchema, data ?? {})
    return memberService.list(parsed, await getAuthRequestContext())
  })
}
