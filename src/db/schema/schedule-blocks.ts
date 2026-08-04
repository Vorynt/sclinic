import {
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
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
import { professionals } from "./professionals"
import { sclinicAppRole } from "./rls"

/**
 * Punctual unavailability for a professional (vacation, meeting, etc.).
 * Not an appointment — counts as busy in availability (ADR-011).
 */
export const scheduleBlocks = pgTable(
  "schedule_blocks",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }).notNull(),
    reason: text("reason"),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("schedule_blocks_clinic_starts_at_idx").on(t.clinicId, t.startsAt),
    index("schedule_blocks_clinic_professional_starts_idx").on(
      t.clinicId,
      t.professionalId,
      t.startsAt,
    ),
    pgPolicy("schedule_blocks_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type ScheduleBlock = typeof scheduleBlocks.$inferSelect
export type NewScheduleBlock = typeof scheduleBlocks.$inferInsert
