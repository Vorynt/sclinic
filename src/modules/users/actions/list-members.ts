"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { memberService } from "@/modules/users/services/member.service"
import type { ClinicMember } from "@/modules/users/types/member"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function listMembersAction(): Promise<ApiResponse<ClinicMember[]>> {
  return toActionResult(async () =>
    memberService.list(await getAuthRequestContext()),
  )
}
