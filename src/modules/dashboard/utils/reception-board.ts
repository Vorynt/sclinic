import type { Appointment } from "@/modules/appointments/types/appointment"
import type { Charge } from "@/modules/billing/types/charge"

export type ReceptionBoardColumnId =
  | "upcoming"
  | "in_progress"
  | "awaiting_payment"

/** Maps appointment + optional active charge to a reception board column (ADR-006). */
export function classifyReceptionBoardColumn(
  appointment: Pick<Appointment, "status">,
  charge: Pick<Charge, "status"> | null,
): ReceptionBoardColumnId | null {
  if (appointment.status === "canceled" || appointment.status === "no_show") {
    return null
  }
  if (appointment.status === "checked_in") return "in_progress"
  if (appointment.status === "completed" && charge?.status === "pending") {
    return "awaiting_payment"
  }
  if (
    appointment.status === "scheduled" ||
    appointment.status === "confirmed"
  ) {
    return "upcoming"
  }
  return null
}
