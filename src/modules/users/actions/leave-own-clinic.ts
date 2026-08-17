"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import type { LeaveOwnClinicResult } from "@/modules/users/dto/leave-own-clinic.dto"
import { leaveOwnClinicSchema } from "@/modules/users/schemas/account.schema"
import { accountService } from "@/modules/users/services/account.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function leaveOwnClinicAction(
  data: unknown,
): Promise<ApiResponse<LeaveOwnClinicResult>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(leaveOwnClinicSchema, data)
    return accountService.leaveClinic(parsed, await getAuthRequestContext())
  })
}
