import { sql } from "drizzle-orm"
import {
  date,
  index,
  pgPolicy,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import { patientGenderEnum, patientStatusEnum } from "./enums"
import {
  addressFields,
  auditBy,
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { sclinicAppRole } from "./rls"

export const patients = pgTable(
  "patients",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    socialName: text("social_name"),
    document: text("document"),
    email: text("email"),
    phone: text("phone"),
    birthDate: date("birth_date"),
    gender: patientGenderEnum("gender"),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    /** Administrative notes only — not a medical record. */
    notes: text("notes"),
    status: patientStatusEnum("status").default("active").notNull(),
    ...addressFields,
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("patients_clinic_id_idx").on(t.clinicId),
    uniqueIndex("patients_clinic_document_uidx")
      .on(t.clinicId, t.document)
      .where(sql`${t.document} IS NOT NULL AND ${t.deletedAt} IS NULL`),
    index("patients_clinic_full_name_idx").on(t.clinicId, t.fullName),
    pgPolicy("patients_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type Patient = typeof patients.$inferSelect
export type NewPatient = typeof patients.$inferInsert
