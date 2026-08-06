"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { confirmAppointmentsBatchSchema } from "@/modules/appointments/schemas/appointment.schema"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { ConfirmAppointmentsBatchResult } from "@/modules/appointments/types/appointment"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function confirmAppointmentsBatchAction(
  data: unknown,
): Promise<ApiResponse<ConfirmAppointmentsBatchResult>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(confirmAppointmentsBatchSchema, data)
    return appointmentService.confirmBatch(parsed, await getAuthRequestContext())
  })
}
