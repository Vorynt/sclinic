"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import type { Clinic } from "@/modules/clinics/types/clinic"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getActiveClinicForSettingsAction(): Promise<
  ApiResponse<Clinic>
> {
  return toActionResult(async () => {
    return clinicService.getActiveForSettings(await getAuthRequestContext())
  })
}
