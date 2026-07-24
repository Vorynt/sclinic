import {
  auditErrorFields,
  recordAudit as emitAuditRecord,
} from "@/core/events"
import type { AuditRecordPayload } from "@/core/events"
import { ensureAuditSubscriber } from "@/modules/audit/subscribers/register-audit-subscriber"

/**
 * Public write contract for other modules.
 * Ensures the subscriber is registered, then emits `audit.record`.
 */
export function recordAudit(payload: AuditRecordPayload): void {
  ensureAuditSubscriber()
  emitAuditRecord(payload)
}

export { auditErrorFields }
export type { AuditRecordPayload }
