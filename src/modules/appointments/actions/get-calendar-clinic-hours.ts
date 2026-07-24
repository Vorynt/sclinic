"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getCalendarClinicHoursAction(): Promise<
  ApiResponse<ClinicWeeklyHours>
> {
  return toActionResult(async () => {
    return appointmentService.getCalendarHours(await getAuthRequestContext())
  })
}
