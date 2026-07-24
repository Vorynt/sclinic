"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { appointmentIdSchema } from "@/modules/medical-records/schemas/clinical-note.schema"
import { clinicalNoteService } from "@/modules/medical-records/services/clinical-note.service"
import type { ClinicalNoteForAppointment } from "@/modules/medical-records/types/clinical-note"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getClinicalNoteForAppointmentAction(
  appointmentId: unknown,
): Promise<ApiResponse<ClinicalNoteForAppointment>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(appointmentIdSchema, appointmentId)
    return clinicalNoteService.getForAppointment(
      parsedId,
      await getAuthRequestContext(),
    )
  })
}
