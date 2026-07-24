import type { AppointmentStatus } from "@/modules/appointments/types/appointment"

/** Vital signs are editable only while the attendance is in progress. */
export function canEditVitalSigns(status: AppointmentStatus): boolean {
  return status === "checked_in"
}
