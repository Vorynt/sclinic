"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function applyDefaultClinicHoursAction(): Promise<
  ApiResponse<ClinicWeeklyHours>
> {
  return toActionResult(async () => {
    return clinicHoursService.applyDefaultHours(await getAuthRequestContext())
  })
}
