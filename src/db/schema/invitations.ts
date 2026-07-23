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
import { invitationStatusEnum } from "./enums"
import {
  clinicIsolation,
  primaryUuid,
  timestamps,
} from "./helpers"
import { professionals } from "./professionals"
import { roles } from "./rbac"
import { sclinicAppRole } from "./rls"

export const invitations = pgTable(
  "invitations",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    /** When set, this invite belongs to a professional onboarding flow. */
    professionalId: uuid("professional_id").references(() => professionals.id, {
      onDelete: "set null",
    }),
    /** SHA-256 (or similar) of the invite token — never store raw tokens. */
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
    status: invitationStatusEnum("status").default("pending").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("invitations_token_hash_uidx").on(t.tokenHash),
    index("invitations_clinic_email_status_idx").on(
      t.clinicId,
      t.email,
      t.status,
    ),
    index("invitations_clinic_professional_idx").on(
      t.clinicId,
      t.professionalId,
    ),
    index("invitations_expires_at_idx").on(t.expiresAt),
    pgPolicy("invitations_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
