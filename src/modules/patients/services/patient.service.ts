import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import type { UpdatePatientDto } from "@/modules/patients/dto/update-patient.dto"
import type { Patient } from "@/modules/patients/types/patient"
import { patientRepository } from "@/modules/patients/repositories/patient.repository"

export const patientService = {
  async create(data: CreatePatientDto): Promise<Patient> {
    return patientRepository.create(data)
  },

  async update(data: UpdatePatientDto): Promise<Patient> {
    const { id, ...rest } = data
    return patientRepository.update(id, rest)
  },

  async delete(id: string): Promise<void> {
    return patientRepository.delete(id)
  },

  async getById(id: string): Promise<Patient | null> {
    return patientRepository.findById(id)
  },
}
