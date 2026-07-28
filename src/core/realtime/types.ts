export const CLINIC_OPS_EVENTS = {
  CHANGED: "clinic.ops.changed",
} as const

export type ClinicOpsEntityType = "appointment" | "charge"

export type ClinicOpsEventType =
  | "appointment.created"
  | "appointment.updated"
  | "appointment.canceled"
  | "charge.created"
  | "charge.updated"
  | "charge.canceled"

/**
 * Lightweight ops signal for reception board / agenda realtime (ADR-006).
 * Never include PHI beyond ids — clients refetch via existing queries.
 */
export type ClinicOpsChangedPayload = {
  clinicId: string
  type: ClinicOpsEventType
  entityType: ClinicOpsEntityType
  entityId: string
  at: string
}
