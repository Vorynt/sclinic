import { on } from "@/core/events/bus"
import { logger } from "@/core/logger"
import {
  CLINIC_OPS_EVENTS,
  type ClinicOpsChangedPayload,
} from "@/core/realtime/types"

type ClinicOpsListener = (payload: ClinicOpsChangedPayload) => void

const listenersByClinic = new Map<string, Set<ClinicOpsListener>>()

let busSubscribed = false

function isClinicOpsPayload(value: unknown): value is ClinicOpsChangedPayload {
  if (!value || typeof value !== "object") return false
  const payload = value as Record<string, unknown>
  return (
    typeof payload.clinicId === "string" &&
    typeof payload.type === "string" &&
    typeof payload.entityType === "string" &&
    typeof payload.entityId === "string" &&
    typeof payload.at === "string"
  )
}

function ensureBusSubscription(): void {
  if (busSubscribed) return
  busSubscribed = true

  on(CLINIC_OPS_EVENTS.CHANGED, (raw) => {
    if (!isClinicOpsPayload(raw)) {
      logger.warn({ raw }, "Ignored invalid clinic.ops.changed payload")
      return
    }

    const listeners = listenersByClinic.get(raw.clinicId)
    if (!listeners || listeners.size === 0) return

    for (const listener of listeners) {
      try {
        listener(raw)
      } catch (error) {
        logger.error(
          { error, clinicId: raw.clinicId },
          "Clinic ops realtime listener failed",
        )
      }
    }
  })
}

/**
 * In-process fan-out for SSE connections (single Node instance).
 * Multi-instance: replace with Redis/Upstash behind the same subscribe API.
 */
export function subscribeClinicOps(
  clinicId: string,
  listener: ClinicOpsListener,
): () => void {
  ensureBusSubscription()

  let set = listenersByClinic.get(clinicId)
  if (!set) {
    set = new Set()
    listenersByClinic.set(clinicId, set)
  }
  set.add(listener)

  return () => {
    set?.delete(listener)
    if (set && set.size === 0) {
      listenersByClinic.delete(clinicId)
    }
  }
}

/** Test helper */
export function clearClinicOpsListeners(): void {
  listenersByClinic.clear()
}
