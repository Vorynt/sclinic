"use server"

import { patientService } from "@/modules/patients/services/patient.service"

export async function deletePatientAction(id: string) {
  return patientService.delete(id)
}
