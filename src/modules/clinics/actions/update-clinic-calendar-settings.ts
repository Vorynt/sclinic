"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { clinicCalendarSettingsSchema } from "@/modules/clinics/schemas/clinic-calendar-settings.schema"
import { clinicCalendarSettingsService } from "@/modules/clinics/services/clinic-calendar-settings.service"
import type { ClinicCalendarSettings } from "@/modules/clinics/types/clinic-calendar-settings"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updateClinicCalendarSettingsAction(
  data: unknown,
): Promise<ApiResponse<ClinicCalendarSettings>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(clinicCalendarSettingsSchema, data)
    return clinicCalendarSettingsService.upsert(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
