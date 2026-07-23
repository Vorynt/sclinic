"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { listAppointmentsSchema } from "@/modules/appointments/schemas/appointment.schema"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { Appointment } from "@/modules/appointments/types/appointment"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function listAppointmentsAction(
  data: unknown,
): Promise<ApiResponse<Appointment[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listAppointmentsSchema, data)
    return appointmentService.list(parsed, await getAuthRequestContext())
  })
}
