import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import type { Patient } from "@/modules/patients/types/patient"

export const patientRepository = {
  async create(_data: CreatePatientDto): Promise<Patient> {
    throw new Error("Not implemented: patient.repository.create")
  },

  async update(_id: string, _data: Partial<CreatePatientDto>): Promise<Patient> {
    throw new Error("Not implemented: patient.repository.update")
  },

  async delete(_id: string): Promise<void> {
    throw new Error("Not implemented: patient.repository.delete")
  },

  async findById(_id: string): Promise<Patient | null> {
    throw new Error("Not implemented: patient.repository.findById")
  },
}
