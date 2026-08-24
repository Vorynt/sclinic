import type { Appointment } from "@/modules/appointments/types/appointment"
import type { Patient } from "@/modules/patients/types/patient"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"
import type {
  VitalSigns,
  VitalSignsForAppointment,
} from "@/modules/medical-records/types/vital-signs"

export type AttendanceBootstrap = {
  appointment: Appointment
  patient: Patient
  currentVitals: VitalSignsForAppointment
  previousVitals: VitalSigns[]
  previousNotes: ClinicalNote[]
}
