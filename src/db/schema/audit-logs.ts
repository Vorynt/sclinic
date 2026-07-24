import { index, jsonb, pgPolicy, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { clinics } from "./clinics"
import { auditStatusEnum } from "./enums"
import { clinicIsolation, primaryUuid, timestamps } from "./helpers"
import { sclinicAppRole } from "./rls"

/**
 * Append-only clinic audit trail.
 * Only `createdAt` from timestamps is meaningful; `updatedAt` is unused.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id"),
    actorName: text("actor_name"),
    actorEmail: text("actor_email"),
    /** Stable action key, e.g. `patient.create`. */
    action: text("action").notNull(),
    status: auditStatusEnum("status").notNull(),
    /** Domain entity, e.g. `patient`, `appointment`, `clinic`. */
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    /** `{ before, after }` snapshot or field diff — never secrets. */
    changes: jsonb("changes").$type<Record<string, unknown> | null>(),
    errorMessage: text("error_message"),
    errorCode: text("error_code"),
    ...timestamps,
  },
  (t) => [
    index("audit_logs_clinic_created_at_idx").on(t.clinicId, t.createdAt),
    index("audit_logs_clinic_entity_idx").on(t.clinicId, t.entityType, t.entityId),
    index("audit_logs_clinic_status_idx").on(t.clinicId, t.status),
    pgPolicy("audit_logs_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type AuditLogRow = typeof auditLogs.$inferSelect
export type NewAuditLogRow = typeof auditLogs.$inferInsert
