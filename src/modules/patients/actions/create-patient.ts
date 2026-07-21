"use server"

import type { Patient } from "@/modules/patients/types/patient"
import { createPatientSchema } from "@/modules/patients/schemas/patient.schema"
import { patientService } from "@/modules/patients/services/patient.service"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function createPatientAction(
  data: unknown,
): Promise<ApiResponse<Patient>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(createPatientSchema, data)
    return patientService.create(parsed)
  })
}
