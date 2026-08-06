import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  pgPolicy,
  pgTable,
  smallint,
  time,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import {
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { professionals } from "./professionals"
import { sclinicAppRole } from "./rls"

/**
 * Weekly working hours per professional (one row per weekday).
 * Same shape as `clinic_business_hours`. Effective window = clinic ∩ professional.
 * No rows → inherit full clinic hours (ADR-011).
 */
export const professionalBusinessHours = pgTable(
  "professional_business_hours",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    dayOfWeek: smallint("day_of_week").notNull(),
    opensAt: time("opens_at"),
    closesAt: time("closes_at"),
    secondOpensAt: time("second_opens_at"),
    secondClosesAt: time("second_closes_at"),
    isClosed: boolean("is_closed").default(false).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("professional_business_hours_prof_day_uidx")
      .on(t.clinicId, t.professionalId, t.dayOfWeek)
      .where(sql`${t.deletedAt} IS NULL`),
    index("professional_business_hours_clinic_id_idx").on(t.clinicId),
    index("professional_business_hours_professional_id_idx").on(
      t.professionalId,
    ),
    pgPolicy("professional_business_hours_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type ProfessionalBusinessHours =
  typeof professionalBusinessHours.$inferSelect
export type NewProfessionalBusinessHours =
  typeof professionalBusinessHours.$inferInsert
