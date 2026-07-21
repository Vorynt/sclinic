"use server"

import type { Patient } from "@/modules/patients/types/patient"
import { patientService } from "@/modules/patients/services/patient.service"
import { AppError, ErrorCode, toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function getPatientAction(
  id: string,
): Promise<ApiResponse<Patient>> {
  return toActionResult(async () => {
    const patient = await patientService.getById(id)
    if (!patient) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Patient not found",
        meta: { id },
      })
    }
    return patient
  })
}
