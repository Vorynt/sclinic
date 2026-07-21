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
import { patientStatusEnum } from "./enums"
import {
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
    document: text("document"),
    email: text("email"),
    phone: text("phone"),
    birthDate: date("birth_date"),
    status: patientStatusEnum("status").default("active").notNull(),
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
