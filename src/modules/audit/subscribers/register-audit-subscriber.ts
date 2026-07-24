import {
  AUDIT_EVENTS,
  on,
  type AuditRecordPayload,
} from "@/core/events"
import { logger } from "@/core/logger"
import { auditService } from "@/modules/audit/services/audit.service"

let registered = false

function isAuditRecordPayload(value: unknown): value is AuditRecordPayload {
  if (!value || typeof value !== "object") return false
  const payload = value as Record<string, unknown>
  return (
    typeof payload.clinicId === "string" &&
    typeof payload.action === "string" &&
    typeof payload.entityType === "string" &&
    (payload.status === "success" || payload.status === "error")
  )
}

/**
 * Subscribes audit persistence to `audit.record`.
 * Idempotent — safe to call from the public emit helper.
 */
export function ensureAuditSubscriber(): void {
  if (registered) return
  registered = true

  on(AUDIT_EVENTS.RECORD, async (payload) => {
    if (!isAuditRecordPayload(payload)) {
      logger.warn({ payload }, "Ignored invalid audit.record payload")
      return
    }

    try {
      await auditService.record(payload)
    } catch (error) {
      logger.error({ error, action: payload.action }, "Failed to persist audit log")
    }
  })
}
