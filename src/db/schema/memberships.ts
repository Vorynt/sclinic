import { sql } from "drizzle-orm"
import {
  boolean,
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
import { membershipStatusEnum } from "./enums"
import {
  membershipVisibility,
  primaryUuid,
  softDelete,
  tenantClinicId,
  tenantUserId,
  timestamps,
} from "./helpers"
import { roles } from "./rbac"
import { sclinicAppRole } from "./rls"

/**
 * N:N User ↔ Clinic. Source of truth for RBAC and clinic switcher (`is_default`).
 */
export const clinicMemberships = pgTable(
  "clinic_memberships",
  {
    id: primaryUuid(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    isDefault: boolean("is_default").default(false).notNull(),
    status: membershipStatusEnum("status").default("active").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("clinic_memberships_user_clinic_uidx")
      .on(t.userId, t.clinicId)
      .where(sql`${t.deletedAt} IS NULL`),
    uniqueIndex("clinic_memberships_user_default_uidx")
      .on(t.userId)
      .where(sql`${t.isDefault} = true AND ${t.deletedAt} IS NULL`),
    index("clinic_memberships_clinic_id_idx").on(t.clinicId),
    index("clinic_memberships_user_id_idx").on(t.userId),
    index("clinic_memberships_role_id_idx").on(t.roleId),
    pgPolicy("clinic_memberships_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: membershipVisibility({
        userIdColumn: t.userId,
        clinicIdColumn: t.clinicId,
      }),
      withCheck: membershipVisibility({
        userIdColumn: t.userId,
        clinicIdColumn: t.clinicId,
      }),
    }),
  ],
)

/**
 * Linked after `clinic_memberships` exists so the EXISTS subquery is valid.
 * Active and suspended members may read their clinic (switcher shows suspended as disabled).
 */
export const clinicsMemberSelectPolicy = pgPolicy("clinics_member_access", {
  as: "permissive",
  to: sclinicAppRole,
  for: "select",
  using: sql`(
    ${clinics.id} = ${tenantClinicId()}
    OR EXISTS (
      SELECT 1
      FROM clinic_memberships m
      WHERE m.clinic_id = ${clinics.id}
        AND m.user_id = ${tenantUserId()}
        AND m.deleted_at IS NULL
        AND m.status IN ('active', 'suspended')
    )
  )`,
}).link(clinics)

export const clinicsTenantWritePolicy = pgPolicy("clinics_tenant_write", {
  as: "permissive",
  to: sclinicAppRole,
  for: "update",
  using: sql`${clinics.id} = ${tenantClinicId()}`,
  withCheck: sql`${clinics.id} = ${tenantClinicId()}`,
}).link(clinics)

/**
 * First-clinic onboarding: authenticated app role may insert a clinic.
 * Tighten when Neon Pool + tenant GUCs are used for all writes.
 */
export const clinicsInsertOnboardingPolicy = pgPolicy(
  "clinics_insert_onboarding",
  {
    as: "permissive",
    to: sclinicAppRole,
    for: "insert",
    withCheck: sql`true`,
  },
).link(clinics)

/**
 * Owner membership bootstrap during onboarding (before tenant GUC is set).
 * Permissive policies OR with the existing tenant isolation policy.
 */
export const clinicMembershipsInsertOnboardingPolicy = pgPolicy(
  "clinic_memberships_insert_onboarding",
  {
    as: "permissive",
    to: sclinicAppRole,
    for: "insert",
    withCheck: sql`true`,
  },
).link(clinicMemberships)

export type ClinicMembership = typeof clinicMemberships.$inferSelect
export type NewClinicMembership = typeof clinicMemberships.$inferInsert
