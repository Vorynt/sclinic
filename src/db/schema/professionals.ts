import { sql } from "drizzle-orm"
import {
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"
import { clinics } from "./clinics"
import {
  affiliationStatusEnum,
  affiliationTypeEnum,
  councilTypeEnum,
  professionalStatusEnum,
  treatmentPronounEnum,
} from "./enums"
import {
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { sclinicAppRole } from "./rls"

/**
 * Health professional profile. `userId` nullable = may exist without login.
 * RBAC for users with login remains on clinic_memberships.
 *
 * `fullName` / `treatmentPronoun` are filled when the professional accepts the invite.
 */
export const professionals = pgTable(
  "professionals",
  {
    id: primaryUuid(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    /** Filled by the professional when accepting the invite (nullable until then). */
    fullName: text("full_name"),
    treatmentPronoun: treatmentPronounEnum("treatment_pronoun"),
    councilType: councilTypeEnum("council_type"),
    councilNumber: text("council_number"),
    councilState: text("council_state"),
    specialty: text("specialty"),
    biography: text("biography"),
    status: professionalStatusEnum("status").default("active").notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("professionals_user_id_uidx")
      .on(t.userId)
      .where(sql`${t.userId} IS NOT NULL AND ${t.deletedAt} IS NULL`),
    uniqueIndex("professionals_council_uidx")
      .on(t.councilType, t.councilNumber, t.councilState)
      .where(
        sql`${t.councilType} IS NOT NULL
          AND ${t.councilNumber} IS NOT NULL
          AND ${t.deletedAt} IS NULL`,
      ),
    index("professionals_status_idx").on(t.status),
  ],
)

/**
 * Display name with optional treatment pronoun (e.g. "Dra. Ana Silva").
 * Used in joins that expose a single `professionalName` string.
 */
export const professionalDisplayNameSql = sql<string | null>`
  CASE
    WHEN ${professionals.fullName} IS NULL THEN NULL
    WHEN ${professionals.treatmentPronoun} IS NULL THEN ${professionals.fullName}
    ELSE concat(
      CASE ${professionals.treatmentPronoun}
        WHEN 'dr' THEN 'Dr. '
        WHEN 'dra' THEN 'Dra. '
        WHEN 'sr' THEN 'Sr. '
        WHEN 'sra' THEN 'Sra. '
        WHEN 'enf' THEN 'Enf. '
        WHEN 'enfa' THEN 'Enfa. '
        ELSE ''
      END,
      ${professionals.fullName}
    )
  END
`

/**
 * Clinical affiliation (where they practice). Not the RBAC source of truth.
 */
export const professionalClinics = pgTable(
  "professional_clinics",
  {
    id: primaryUuid(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    affiliationType: affiliationTypeEnum("affiliation_type")
      .default("attending")
      .notNull(),
    status: affiliationStatusEnum("status").default("active").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("professional_clinics_professional_clinic_uidx")
      .on(t.professionalId, t.clinicId)
      .where(sql`${t.deletedAt} IS NULL`),
    index("professional_clinics_clinic_id_idx").on(t.clinicId),
    pgPolicy("professional_clinics_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type Professional = typeof professionals.$inferSelect
export type ProfessionalClinic = typeof professionalClinics.$inferSelect
