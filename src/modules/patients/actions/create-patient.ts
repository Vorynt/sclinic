"use server"

import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import { patientService } from "@/modules/patients/services/patient.service"
import { toActionResult } from "@/shared/errors"
import type { ApiResponse } from "@/types/api"
import type { Patient } from "@/modules/patients/types/patient"

export async function createPatientAction(
  data: CreatePatientDto,
): Promise<ApiResponse<Patient>> {
  return toActionResult(() => patientService.create(data))
}
