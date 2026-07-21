"use server"

import type { UpdatePatientDto } from "@/modules/patients/dto/update-patient.dto"
import type { Patient } from "@/modules/patients/types/patient"
import { patientService } from "@/modules/patients/services/patient.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"

export async function updatePatientAction(
  data: UpdatePatientDto,
): Promise<ApiResponse<Patient>> {
  return toActionResult(() => patientService.update(data))
}
