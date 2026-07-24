import { sql } from "drizzle-orm"
import {
  index,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { appointments } from "./appointments"
import { clinics } from "./clinics"
import {
  auditBy,
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { patients } from "./patients"
import { professionals } from "./professionals"
import { sclinicAppRole } from "./rls"

/** TipTap document JSON stored as jsonb. */
export type ClinicalNoteContent = Record<string, unknown>

/**
 * One clinical note per appointment (medical record).
 * Distinct from administrative `patients.notes` / `appointments.notes`.
 */
export const clinicalNotes = pgTable(
  "clinical_notes",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    appointmentId: uuid("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "restrict" }),
    professionalId: uuid("professional_id").references(() => professionals.id, {
      onDelete: "set null",
    }),
    content: jsonb("content").$type<ClinicalNoteContent>().notNull(),
    /** Derived plain text for preview and search. */
    plainText: text("plain_text").notNull(),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("clinical_notes_clinic_patient_idx").on(t.clinicId, t.patientId),
    index("clinical_notes_clinic_appointment_idx").on(
      t.clinicId,
      t.appointmentId,
    ),
    uniqueIndex("clinical_notes_appointment_uidx")
      .on(t.appointmentId)
      .where(sql`${t.deletedAt} IS NULL`),
    pgPolicy("clinical_notes_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type ClinicalNoteRow = typeof clinicalNotes.$inferSelect
export type NewClinicalNote = typeof clinicalNotes.$inferInsert
