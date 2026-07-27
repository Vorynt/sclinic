import type {
  ClinicalNoteContent,
  ClinicalNoteFormValues,
} from "@/db/schema"
import type { ClinicalNoteTemplateId } from "@/modules/medical-records/constants/clinical-note-templates"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"

type ClinicalNoteRow = {
  id: string
  clinicId: string
  patientId: string
  appointmentId: string
  professionalId: string | null
  professionalName: string | null
  content: ClinicalNoteContent
  plainText: string
  templateId: string | null
  formValues: ClinicalNoteFormValues | null
  appointmentStartsAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export function toClinicalNote(row: ClinicalNoteRow): ClinicalNote {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    appointmentId: row.appointmentId,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    content: row.content,
    plainText: row.plainText,
    templateId: (row.templateId as ClinicalNoteTemplateId | null) ?? null,
    formValues: row.formValues ?? null,
    appointmentStartsAt: row.appointmentStartsAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
