import { sql } from "drizzle-orm"
import {
  doublePrecision,
  index,
  integer,
  pgPolicy,
  pgTable,
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

/**
 * One vital-signs reading per appointment.
 * Patient-scoped history is built by listing rows for the same patientId.
 */
export const vitalSigns = pgTable(
  "vital_signs",
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
    systolicMmHg: integer("systolic_mm_hg"),
    diastolicMmHg: integer("diastolic_mm_hg"),
    heartRateBpm: integer("heart_rate_bpm"),
    respiratoryRate: integer("respiratory_rate"),
    temperatureC: doublePrecision("temperature_c"),
    weightKg: doublePrecision("weight_kg"),
    heightCm: doublePrecision("height_cm"),
    spo2Percent: integer("spo2_percent"),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("vital_signs_clinic_patient_idx").on(t.clinicId, t.patientId),
    index("vital_signs_clinic_appointment_idx").on(
      t.clinicId,
      t.appointmentId,
    ),
    uniqueIndex("vital_signs_appointment_uidx")
      .on(t.appointmentId)
      .where(sql`${t.deletedAt} IS NULL`),
    pgPolicy("vital_signs_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type VitalSignsRow = typeof vitalSigns.$inferSelect
export type NewVitalSigns = typeof vitalSigns.$inferInsert
