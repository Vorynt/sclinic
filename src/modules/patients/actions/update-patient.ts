"use server"

import type { UpdatePatientDto } from "@/modules/patients/dto/update-patient.dto"
import { patientService } from "@/modules/patients/services/patient.service"

export async function updatePatientAction(data: UpdatePatientDto) {
  return patientService.update(data)
}
