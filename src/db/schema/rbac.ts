import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import {
  auditBy,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"

/**
 * RBAC catalog.
 * - System roles: clinic_id IS NULL, is_system = true (Owner, Admin, …)
 * - Custom roles: clinic_id set (optional future)
 */
export const roles = pgTable(
  "roles",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id").references(() => clinics.id, {
      onDelete: "cascade",
    }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("roles_system_key_uidx")
      .on(t.key)
      .where(sql`${t.clinicId} IS NULL AND ${t.deletedAt} IS NULL`),
    uniqueIndex("roles_clinic_key_uidx")
      .on(t.clinicId, t.key)
      .where(sql`${t.clinicId} IS NOT NULL AND ${t.deletedAt} IS NULL`),
    index("roles_clinic_id_idx").on(t.clinicId),
  ],
)

export const permissions = pgTable(
  "permissions",
  {
    id: primaryUuid(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    module: text("module").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (t) => [uniqueIndex("permissions_key_uidx").on(t.key)],
)

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: primaryUuid(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    ...timestamps,
    ...auditBy,
  },
  (t) => [
    uniqueIndex("role_permissions_role_permission_uidx").on(
      t.roleId,
      t.permissionId,
    ),
    index("role_permissions_permission_id_idx").on(t.permissionId),
  ],
)

export type Role = typeof roles.$inferSelect
export type Permission = typeof permissions.$inferSelect
