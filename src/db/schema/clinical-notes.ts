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

/** TipTap document JSON stored as jsonb — source of truth for clinical notes. */
export type ClinicalNoteContent = Record<string, unknown>

/** @deprecated Legacy structured form answers (pre ADR-015). */
export type ClinicalNoteFormValues = Record<string, unknown>

/**
 * One clinical note per appointment (medical record).
 * Distinct from administrative `patients.notes` / `appointments.notes`.
 *
 * TipTap-first (ADR-015): `content` + `plainText` are the source of truth.
 * Legacy form notes may still have `templateId` + `formValues` until re-saved.
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
    /** Clinical form template id when note was authored as structured form. */
    templateId: text("template_id"),
    /** Structured field values for the template (source of truth). */
    formValues: jsonb("form_values").$type<ClinicalNoteFormValues>(),
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
