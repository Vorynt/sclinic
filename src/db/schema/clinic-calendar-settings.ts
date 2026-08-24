import { jsonb, pgPolicy, pgTable, uuid } from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import { clinicIsolation, timestamps } from "./helpers"
import { sclinicAppRole } from "./rls"

/**
 * One row per clinic: display preferences for the appointments calendar.
 * JSON document is merged with application defaults in the clinics service.
 */
export const clinicCalendarSettings = pgTable(
  "clinic_calendar_settings",
  {
    clinicId: uuid("clinic_id")
      .primaryKey()
      .references(() => clinics.id, { onDelete: "cascade" }),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull(),
    ...timestamps,
  },
  (t) => [
    pgPolicy("clinic_calendar_settings_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type ClinicCalendarSettingsRow =
  typeof clinicCalendarSettings.$inferSelect
export type NewClinicCalendarSettingsRow =
  typeof clinicCalendarSettings.$inferInsert
