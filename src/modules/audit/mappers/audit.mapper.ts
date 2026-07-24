import type { AuditLogRow } from "@/db/schema"
import type { AuditLog } from "@/modules/audit/types/audit"
import type { AuditStatus } from "@/core/events"

export function toAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    clinicId: row.clinicId,
    actorUserId: row.actorUserId ?? null,
    actorName: row.actorName ?? null,
    actorEmail: row.actorEmail ?? null,
    action: row.action,
    status: row.status as AuditStatus,
    entityType: row.entityType,
    entityId: row.entityId ?? null,
    changes: (row.changes as Record<string, unknown> | null) ?? null,
    errorMessage: row.errorMessage ?? null,
    errorCode: row.errorCode ?? null,
    createdAt: row.createdAt,
  }
}
