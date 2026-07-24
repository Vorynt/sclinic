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
import { sclinicAppRole } from "./rls"

/**
 * Weekly opening hours per clinic (one row per weekday).
 * `dayOfWeek`: 0 = Sunday … 6 = Saturday (JS `Date#getDay()`).
 *
 * Up to two intervals per day (e.g. morning + afternoon with lunch break):
 * - Interval 1: `opensAt` / `closesAt` (required when `!isClosed`)
 * - Interval 2: `secondOpensAt` / `secondClosesAt` (optional)
 */
export const clinicBusinessHours = pgTable(
  "clinic_business_hours",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
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
    uniqueIndex("clinic_business_hours_clinic_day_uidx")
      .on(t.clinicId, t.dayOfWeek)
      .where(sql`${t.deletedAt} IS NULL`),
    index("clinic_business_hours_clinic_id_idx").on(t.clinicId),
    pgPolicy("clinic_business_hours_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type ClinicBusinessHours = typeof clinicBusinessHours.$inferSelect
export type NewClinicBusinessHours = typeof clinicBusinessHours.$inferInsert
