"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { clinicCalendarSettingsService } from "@/modules/clinics/services/clinic-calendar-settings.service"
import type { ClinicCalendarSettings } from "@/modules/clinics/types/clinic-calendar-settings"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getClinicCalendarSettingsAction(): Promise<
  ApiResponse<ClinicCalendarSettings>
> {
  return toActionResult(async () => {
    return clinicCalendarSettingsService.get(await getAuthRequestContext())
  })
}
