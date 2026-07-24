"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { clinicWeeklyHoursSchema } from "@/modules/clinics/schemas/clinic-hours.schema"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function upsertClinicHoursAction(
  data: unknown,
): Promise<ApiResponse<ClinicWeeklyHours>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(clinicWeeklyHoursSchema, data)
    return clinicHoursService.upsertWeeklyHours(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
