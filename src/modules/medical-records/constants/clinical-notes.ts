import type { AppointmentStatus } from "@/modules/appointments/types/appointment"

/** Clinical notes are editable only while the attendance is in progress. */
export function canEditClinicalNote(status: AppointmentStatus): boolean {
  return status === "checked_in"
}
