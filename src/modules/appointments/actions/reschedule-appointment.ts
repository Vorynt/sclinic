"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { rescheduleAppointmentSchema } from "@/modules/appointments/schemas/appointment.schema"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function rescheduleAppointmentAction(
  data: unknown,
): Promise<ApiResponse<Appointment>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(rescheduleAppointmentSchema, data)
    return appointmentService.reschedule(parsed, await getAuthRequestContext())
  })
}
