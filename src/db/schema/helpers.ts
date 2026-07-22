import { sql, type SQL } from "drizzle-orm"
import {
  type AnyPgColumn,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

/** UUID primary key with gen_random_uuid() (pgcrypto / PG13+). */
export const primaryUuid = () =>
  uuid("id").default(sql`gen_random_uuid()`).primaryKey()

/** Better Auth–compatible text primary key (stores UUID strings). */
export const primaryTextId = () => text("id").primaryKey()

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}

export const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
}

/** Audit FKs point to Better Auth `user.id` (text). */
export const auditBy = {
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
}

/** Brazilian postal address — reused by clinics and patients. */
export const addressFields = {
  addressStreet: text("address_street"),
  addressNumber: text("address_number"),
  addressComplement: text("address_complement"),
  addressNeighborhood: text("address_neighborhood"),
  addressCity: text("address_city"),
  addressState: text("address_state"),
  addressZip: text("address_zip"),
}

/**
 * Session GUCs used by RLS policies.
 * Set via `setTenantContext` before tenant-scoped queries.
 */
export const tenantClinicId = (): SQL =>
  sql`nullif(current_setting('app.clinic_id', true), '')::uuid`

export const tenantUserId = (): SQL =>
  sql`nullif(current_setting('app.user_id', true), '')`

/** Match row.clinic_id to the active tenant. */
export const clinicIsolation = (clinicIdColumn: AnyPgColumn): SQL =>
  sql`${clinicIdColumn} = ${tenantClinicId()}`

/** Membership visibility: own rows OR rows of the active clinic. */
export const membershipVisibility = (args: {
  userIdColumn: AnyPgColumn
  clinicIdColumn: AnyPgColumn
}): SQL =>
  sql`(
    ${args.userIdColumn} = ${tenantUserId()}
    OR ${args.clinicIdColumn} = ${tenantClinicId()}
  )`
