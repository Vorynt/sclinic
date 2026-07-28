import type {
  ClinicalNoteContent,
  ClinicalNoteFormValues,
} from "@/db/schema"
import type { ClinicalNoteTemplateId } from "@/modules/medical-records/constants/clinical-note-templates"

export type ClinicalNote = {
  id: string
  clinicId: string
  patientId: string
  appointmentId: string
  professionalId: string | null
  professionalName: string | null
  content: ClinicalNoteContent
  plainText: string
  templateId: ClinicalNoteTemplateId | null
  formValues: ClinicalNoteFormValues | null
  appointmentStartsAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Note for the current attendance plus whether it can be edited. */
export type ClinicalNoteForAppointment = {
  note: ClinicalNote | null
  appointmentId: string
  patientId: string
  editable: boolean
}
