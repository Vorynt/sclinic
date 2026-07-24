import { emit } from "@/core/events/bus"
import {
  AUDIT_EVENTS,
  type AuditRecordPayload,
} from "@/core/events/types"
import { AppError, getClientMessage, isAppError } from "@/shared/errors"

export type { AuditChanges, AuditRecordPayload, AuditStatus } from "@/core/events/types"
export { AUDIT_EVENTS } from "@/core/events/types"

/**
 * Emits an audit record event. Persistence is handled by the audit subscriber.
 * Safe to call from domain services — never throws.
 */
export function recordAudit(payload: AuditRecordPayload): void {
  try {
    emit(AUDIT_EVENTS.RECORD, payload)
  } catch (error) {
    // Bus itself should not throw; belt-and-suspenders for emitters.
    void error
  }
}

export function auditErrorFields(error: unknown): {
  errorMessage: string
  errorCode: string | null
} {
  if (isAppError(error)) {
    return {
      errorMessage: error.message || getClientMessage(error.code),
      errorCode: error.code,
    }
  }

  if (error instanceof Error) {
    return {
      errorMessage: error.message || "Unexpected error",
      errorCode: null,
    }
  }

  return {
    errorMessage: "Unexpected error",
    errorCode: null,
  }
}

/** Convenience when the failure is known to be an AppError-shaped throw. */
export function isAuditAppError(error: unknown): error is AppError {
  return isAppError(error)
}
