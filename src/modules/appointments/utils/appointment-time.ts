/** Duration in whole minutes between two appointment timestamps. */
export function getAppointmentDurationMinutes(
  startsAt: Date,
  endsAt: Date,
): number {
  return Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000)
}

/** Two ranges [aStart, aEnd) and [bStart, bEnd) overlap. */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart
}
