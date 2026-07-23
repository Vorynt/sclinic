import type { Appointment } from "@/modules/appointments/types/appointment"

export type LaidOutAppointment = {
  appointment: Appointment
  /** 0-based column index within its overlap cluster. */
  column: number
  /** Total columns in the appointment's overlap cluster. */
  columnCount: number
}

function overlaps(a: Appointment, b: Appointment): boolean {
  return (
    a.startsAt.getTime() < b.endsAt.getTime() &&
    b.startsAt.getTime() < a.endsAt.getTime()
  )
}

/**
 * Assigns side-by-side columns to overlapping appointments so they can be
 * rendered next to each other on a time grid instead of stacking on top.
 * Greedy clustering + column packing — good enough for typical clinic
 * schedules (a handful of concurrent appointments per day).
 */
export function layoutOverlappingAppointments(
  appointments: Appointment[],
): LaidOutAppointment[] {
  const sorted = [...appointments].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  )

  const clusters: Appointment[][] = []
  let currentCluster: Appointment[] = []
  let clusterEnd = -Infinity

  for (const appointment of sorted) {
    if (
      currentCluster.length === 0 ||
      appointment.startsAt.getTime() < clusterEnd
    ) {
      currentCluster.push(appointment)
      clusterEnd = Math.max(clusterEnd, appointment.endsAt.getTime())
    } else {
      clusters.push(currentCluster)
      currentCluster = [appointment]
      clusterEnd = appointment.endsAt.getTime()
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster)

  const result: LaidOutAppointment[] = []

  for (const cluster of clusters) {
    const columns: Appointment[][] = []

    for (const appointment of cluster) {
      const column = columns.find((candidate) => {
        const last = candidate[candidate.length - 1]
        return last ? !overlaps(last, appointment) : true
      })

      if (column) {
        column.push(appointment)
      } else {
        columns.push([appointment])
      }
    }

    const columnCount = columns.length
    columns.forEach((column, columnIndex) => {
      for (const appointment of column) {
        result.push({ appointment, column: columnIndex, columnCount })
      }
    })
  }

  return result
}
