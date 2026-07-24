import {
  index,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import {
  clinicalAlertKindEnum,
  clinicalAlertSeverityEnum,
} from "./enums"
import {
  auditBy,
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { patients } from "./patients"
import { sclinicAppRole } from "./rls"

/**
 * Patient-scoped clinical alerts (allergies, restrictions, attention flags).
 * Not tied to a single appointment — visible across attendances and future chart.
 */
export const patientClinicalAlerts = pgTable(
  "patient_clinical_alerts",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    kind: clinicalAlertKindEnum("kind").notNull(),
    label: text("label").notNull(),
    severity: clinicalAlertSeverityEnum("severity").default("medium").notNull(),
    notes: text("notes"),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("patient_clinical_alerts_clinic_patient_idx").on(
      t.clinicId,
      t.patientId,
    ),
    index("patient_clinical_alerts_clinic_kind_idx").on(t.clinicId, t.kind),
    pgPolicy("patient_clinical_alerts_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type PatientClinicalAlertRow = typeof patientClinicalAlerts.$inferSelect
export type NewPatientClinicalAlert = typeof patientClinicalAlerts.$inferInsert
