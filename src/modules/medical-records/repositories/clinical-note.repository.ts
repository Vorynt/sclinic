import { and, desc, eq, isNull, ne } from "drizzle-orm"

import { db } from "@/db"
import {
  appointments,
  clinicalNotes,
  professionalDisplayNameSql,
  professionals,
  type ClinicalNoteContent,
} from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toClinicalNote } from "@/modules/medical-records/mappers/clinical-note.mapper"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"

const clinicalNoteSelect = {
  id: clinicalNotes.id,
  clinicId: clinicalNotes.clinicId,
  patientId: clinicalNotes.patientId,
  appointmentId: clinicalNotes.appointmentId,
  professionalId: clinicalNotes.professionalId,
  professionalName: professionalDisplayNameSql,
  content: clinicalNotes.content,
  plainText: clinicalNotes.plainText,
  appointmentStartsAt: appointments.startsAt,
  createdAt: clinicalNotes.createdAt,
  updatedAt: clinicalNotes.updatedAt,
}

function clinicalNoteJoin() {
  return db
    .select(clinicalNoteSelect)
    .from(clinicalNotes)
    .innerJoin(appointments, eq(appointments.id, clinicalNotes.appointmentId))
    .leftJoin(
      professionals,
      eq(professionals.id, clinicalNotes.professionalId),
    )
}

export const clinicalNoteRepository = {
  async findByAppointmentId(
    appointmentId: string,
    clinicId: string,
  ): Promise<ClinicalNote | null> {
    return withDbError(async () => {
      const [row] = await clinicalNoteJoin()
        .where(
          and(
            eq(clinicalNotes.appointmentId, appointmentId),
            eq(clinicalNotes.clinicId, clinicId),
            isNull(clinicalNotes.deletedAt),
          ),
        )
        .limit(1)

      return row ? toClinicalNote(row) : null
    })
  },

  async listByPatient(params: {
    clinicId: string
    patientId: string
    excludeAppointmentId?: string
  }): Promise<ClinicalNote[]> {
    return withDbError(async () => {
      const rows = await clinicalNoteJoin()
        .where(
          and(
            eq(clinicalNotes.clinicId, params.clinicId),
            eq(clinicalNotes.patientId, params.patientId),
            params.excludeAppointmentId
              ? ne(clinicalNotes.appointmentId, params.excludeAppointmentId)
              : undefined,
            isNull(clinicalNotes.deletedAt),
            isNull(appointments.deletedAt),
          ),
        )
        .orderBy(desc(appointments.startsAt))

      return rows.map(toClinicalNote)
    })
  },

  async create(params: {
    clinicId: string
    patientId: string
    appointmentId: string
    professionalId: string | null
    content: ClinicalNoteContent
    plainText: string
    createdBy: string
  }): Promise<ClinicalNote> {
    return withDbError(async () => {
      const [row] = await db
        .insert(clinicalNotes)
        .values({
          clinicId: params.clinicId,
          patientId: params.patientId,
          appointmentId: params.appointmentId,
          professionalId: params.professionalId,
          content: params.content,
          plainText: params.plainText,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({ id: clinicalNotes.id })

      if (!row) {
        throw new Error("Failed to create clinical note")
      }

      const created = await clinicalNoteRepository.findByAppointmentId(
        params.appointmentId,
        params.clinicId,
      )
      if (!created) {
        throw new Error("Failed to load clinical note after create")
      }
      return created
    })
  },

  async update(params: {
    id: string
    clinicId: string
    professionalId: string | null
    content: ClinicalNoteContent
    plainText: string
    updatedBy: string
  }): Promise<ClinicalNote> {
    return withDbError(async () => {
      const [row] = await db
        .update(clinicalNotes)
        .set({
          content: params.content,
          plainText: params.plainText,
          professionalId: params.professionalId,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(clinicalNotes.id, params.id),
            eq(clinicalNotes.clinicId, params.clinicId),
            isNull(clinicalNotes.deletedAt),
          ),
        )
        .returning({
          id: clinicalNotes.id,
          appointmentId: clinicalNotes.appointmentId,
        })

      if (!row) {
        throw new Error("Failed to update clinical note")
      }

      const updated = await clinicalNoteRepository.findByAppointmentId(
        row.appointmentId,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load clinical note after update")
      }
      return updated
    })
  },
}
