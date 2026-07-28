import type { Appointment } from "@/modules/appointments/types/appointment"

export type DayOpsStats = {
  total: number
  waiting: number
  inProgress: number
  completed: number
}

/** Derives day operational counts from appointments (excludes canceled / no_show). */
export function summarizeDayOps(
  appointments: ReadonlyArray<Pick<Appointment, "status">>,
): DayOpsStats {
  let total = 0
  let waiting = 0
  let inProgress = 0
  let completed = 0

  for (const appointment of appointments) {
    if (
      appointment.status === "canceled" ||
      appointment.status === "no_show"
    ) {
      continue
    }

    total += 1

    if (
      appointment.status === "scheduled" ||
      appointment.status === "confirmed"
    ) {
      waiting += 1
    } else if (appointment.status === "checked_in") {
      inProgress += 1
    } else if (appointment.status === "completed") {
      completed += 1
    }
  }

  return { total, waiting, inProgress, completed }
}
