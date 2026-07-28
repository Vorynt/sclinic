import type { Appointment } from "@/modules/appointments/types/appointment"
import type { Charge } from "@/modules/billing/types/charge"

export type ReceptionBoardColumnId =
  | "upcoming"
  | "in_progress"
  | "awaiting_payment"

export type ReceptionBoardColumnCounts = Record<ReceptionBoardColumnId, number>

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

/** Counts appointments into reception board columns. */
export function countReceptionBoardColumns(
  items: ReadonlyArray<{
    appointment: Pick<Appointment, "status">
    charge: Pick<Charge, "status"> | null
  }>,
): ReceptionBoardColumnCounts {
  const counts: ReceptionBoardColumnCounts = {
    upcoming: 0,
    in_progress: 0,
    awaiting_payment: 0,
  }

  for (const item of items) {
    const column = classifyReceptionBoardColumn(item.appointment, item.charge)
    if (column) counts[column] += 1
  }

  return counts
}

