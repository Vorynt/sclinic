import { format } from "date-fns"

import type { Appointment } from "@/modules/appointments/types/appointment"

export function groupAppointmentsByDay(
  appointments: Appointment[],
): Map<string, Appointment[]> {
  const grouped = new Map<string, Appointment[]>()

  for (const appointment of appointments) {
    const key = format(appointment.startsAt, "yyyy-MM-dd")
    const bucket = grouped.get(key)
    if (bucket) {
      bucket.push(appointment)
    } else {
      grouped.set(key, [appointment])
    }
  }

  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
  }

  return grouped
}
