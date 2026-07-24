"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { requireClinic } from "@/modules/authentication/permissions/guards"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function hasClinicHoursConfiguredAction(): Promise<
  ApiResponse<boolean>
> {
  return toActionResult(async () => {
    const auth = await requireClinic(await getAuthRequestContext())
    return clinicHoursService.hasConfiguredHours(auth.clinicId)
  })
}
