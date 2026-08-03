import {
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { clinicServices } from "./clinic-services"
import { clinics } from "./clinics"
import { appointmentStatusEnum, appointmentTypeEnum } from "./enums"
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

export const appointments = pgTable(
  "appointments",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    professionalId: uuid("professional_id").references(() => professionals.id, {
      onDelete: "set null",
    }),
    /** Catalog service used for pricing (ADR-009). Nullable for legacy rows. */
    serviceId: uuid("service_id").references(() => clinicServices.id, {
      onDelete: "restrict",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }).notNull(),
    type: appointmentTypeEnum("type").default("consultation").notNull(),
    status: appointmentStatusEnum("status").default("scheduled").notNull(),
    reason: text("reason"),
    notes: text("notes"),
    canceledAt: timestamp("canceled_at", { withTimezone: true, mode: "date" }),
    canceledReason: text("canceled_reason"),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("appointments_clinic_starts_at_idx").on(t.clinicId, t.startsAt),
    index("appointments_clinic_professional_starts_idx").on(
      t.clinicId,
      t.professionalId,
      t.startsAt,
    ),
    index("appointments_clinic_patient_idx").on(t.clinicId, t.patientId),
    index("appointments_clinic_service_idx").on(t.clinicId, t.serviceId),
    index("appointments_clinic_status_starts_idx").on(
      t.clinicId,
      t.status,
      t.startsAt,
    ),
    pgPolicy("appointments_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
