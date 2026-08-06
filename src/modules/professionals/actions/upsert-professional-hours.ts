"use server"

import { upsertProfessionalHoursSchema } from "@/modules/professionals/schemas/professional-hours.schema"
import { professionalHoursService } from "@/modules/professionals/services/professional-hours.service"
import type { ProfessionalWeeklyHours } from "@/modules/professionals/types/professional-hours"
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function upsertProfessionalHoursAction(
  data: unknown,
): Promise<ApiResponse<ProfessionalWeeklyHours>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(upsertProfessionalHoursSchema, data)
    return professionalHoursService.upsertWeeklyHours(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
