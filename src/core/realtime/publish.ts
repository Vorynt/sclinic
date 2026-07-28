import { emit } from "@/core/events/bus"
import {
  CLINIC_OPS_EVENTS,
  type ClinicOpsChangedPayload,
  type ClinicOpsEntityType,
  type ClinicOpsEventType,
} from "@/core/realtime/types"

/**
 * Publishes a clinic ops signal for realtime subscribers (SSE).
 * Safe to call from domain services — never throws.
 */
export function publishClinicOps(params: {
  clinicId: string
  type: ClinicOpsEventType
  entityType: ClinicOpsEntityType
  entityId: string
}): void {
  const payload: ClinicOpsChangedPayload = {
    clinicId: params.clinicId,
    type: params.type,
    entityType: params.entityType,
    entityId: params.entityId,
    at: new Date().toISOString(),
  }

  try {
    emit(CLINIC_OPS_EVENTS.CHANGED, payload)
  } catch {
    // Bus should not throw; keep emitters safe.
  }
}
