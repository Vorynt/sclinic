"use server"

import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import { patientService } from "@/modules/patients/services/patient.service"

export async function createPatientAction(data: CreatePatientDto) {
  return patientService.create(data)
}
