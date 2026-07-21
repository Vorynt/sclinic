"use server"

import { patientService } from "@/modules/patients/services/patient.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function deletePatientAction(
  id: string,
): Promise<ApiResponse<void>> {
  return toActionResult(() => patientService.delete(id))
}
