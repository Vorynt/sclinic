"use server"

import type { Patient } from "@/modules/patients/types/patient"
import { updatePatientSchema } from "@/modules/patients/schemas/patient.schema"
import { patientService } from "@/modules/patients/services/patient.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function updatePatientAction(
  data: unknown,
): Promise<ApiResponse<Patient>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(updatePatientSchema, data)
    return patientService.update(parsed)
  })
}
