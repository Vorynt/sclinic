"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { countAppointmentsSchema } from "@/modules/appointments/schemas/appointment.schema"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function countAppointmentsAction(
  data: unknown,
): Promise<ApiResponse<number>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(countAppointmentsSchema, data)
    return appointmentService.countInRange(
      parsed,
      await getAuthRequestContext(),
    )
  })
}
