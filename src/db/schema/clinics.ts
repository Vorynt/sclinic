import { sql } from "drizzle-orm"
import {
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { clinicSubscriptionStatusEnum } from "./enums"
import {
  auditBy,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"

/**
 * Tenant root. Every operational row must reference clinics.id.
 * RLS policies are linked from `memberships.ts` (needs clinic_memberships).
 */
export const clinics = pgTable(
  "clinics",
  {
    id: primaryUuid(),
    name: text("name").notNull(),
    tradeName: text("trade_name"),
    document: text("document"),
    email: text("email"),
    phone: text("phone"),
    logoUrl: text("logo_url"),
    timezone: text("timezone").default("America/Sao_Paulo").notNull(),
    subscriptionStatus: clinicSubscriptionStatusEnum("subscription_status")
      .default("none")
      .notNull(),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    uniqueIndex("clinics_document_uidx")
      .on(t.document)
      .where(sql`${t.document} IS NOT NULL AND ${t.deletedAt} IS NULL`),
    index("clinics_subscription_status_idx").on(t.subscriptionStatus),
  ],
)

export type Clinic = typeof clinics.$inferSelect
export type NewClinic = typeof clinics.$inferInsert
