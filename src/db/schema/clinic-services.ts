import {
  boolean,
  index,
  integer,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import {
  auditBy,
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { sclinicAppRole } from "./rls"

/**
 * Clinic-scoped catalog of billable services (fixed price).
 * Any professional may use any active service (ADR-009).
 */
export const clinicServices = pgTable(
  "clinic_services",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").default("BRL").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("clinic_services_clinic_active_idx").on(t.clinicId, t.isActive),
    index("clinic_services_clinic_name_idx").on(t.clinicId, t.name),
    pgPolicy("clinic_services_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type ClinicService = typeof clinicServices.$inferSelect
export type NewClinicService = typeof clinicServices.$inferInsert
