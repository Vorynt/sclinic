"use server"

import type { Patient } from "@/modules/patients/types/patient"
import { patientIdSchema } from "@/modules/patients/schemas/patient.schema"
import { patientService } from "@/modules/patients/services/patient.service"
import { AppError, ErrorCode, toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getPatientAction(
  id: unknown,
): Promise<ApiResponse<Patient>> {
  return toActionResult(async () => {
    const parsedId = parseOrThrow(patientIdSchema, id)
    const patient = await patientService.getById(parsedId)
    if (!patient) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Patient not found",
        meta: { id: parsedId },
      })
    }
    return patient
  })
}
