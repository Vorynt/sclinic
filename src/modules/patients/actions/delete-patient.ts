"use server"

import { patientIdSchema } from "@/modules/patients/schemas/patient.schema"
import { patientService } from "@/modules/patients/services/patient.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function deletePatientAction(
  id: unknown,
): Promise<ApiResponse<void>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(patientIdSchema, id)
    return patientService.delete(parsedId)
  })
}
