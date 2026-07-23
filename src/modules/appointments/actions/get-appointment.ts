"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { appointmentIdSchema } from "@/modules/appointments/schemas/appointment.schema"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getAppointmentAction(
  id: unknown,
): Promise<ApiResponse<Appointment>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(appointmentIdSchema, id)
    return appointmentService.getById(parsedId, await getAuthRequestContext())
  })
}
