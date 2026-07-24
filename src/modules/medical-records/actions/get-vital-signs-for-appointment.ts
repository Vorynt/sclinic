"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { appointmentIdSchema } from "@/modules/medical-records/schemas/vital-signs.schema"
import { vitalSignsService } from "@/modules/medical-records/services/vital-signs.service"
import type { VitalSignsForAppointment } from "@/modules/medical-records/types/vital-signs"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getVitalSignsForAppointmentAction(
  appointmentId: unknown,
): Promise<ApiResponse<VitalSignsForAppointment>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(appointmentIdSchema, appointmentId)
    return vitalSignsService.getForAppointment(
      parsedId,
      await getAuthRequestContext(),
    )
  })
}
