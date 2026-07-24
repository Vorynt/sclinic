import type { ClinicalNoteContent } from "@/db/schema"
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
    appointmentStartsAt: row.appointmentStartsAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
