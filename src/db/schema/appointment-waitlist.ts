import {
  index,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { clinicServices } from "./clinic-services"
import { clinics } from "./clinics"
import { waitlistStatusEnum } from "./enums"
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
 * Waiting queue for a free slot (ADR-011).
 * Does not reserve a slot until promote → appointment create.
 */
export const appointmentWaitlist = pgTable(
  "appointment_waitlist",
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
    serviceId: uuid("service_id").references(() => clinicServices.id, {
      onDelete: "set null",
    }),
    status: waitlistStatusEnum("status").default("waiting").notNull(),
    notes: text("notes"),
    promotedAppointmentId: uuid("promoted_appointment_id"),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("appointment_waitlist_clinic_status_idx").on(t.clinicId, t.status),
    index("appointment_waitlist_clinic_professional_status_idx").on(
      t.clinicId,
      t.professionalId,
      t.status,
    ),
    index("appointment_waitlist_clinic_patient_idx").on(t.clinicId, t.patientId),
    pgPolicy("appointment_waitlist_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type AppointmentWaitlist = typeof appointmentWaitlist.$inferSelect
export type NewAppointmentWaitlist = typeof appointmentWaitlist.$inferInsert
