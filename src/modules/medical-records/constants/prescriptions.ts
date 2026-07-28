import type { AppointmentStatus } from "@/modules/appointments/types/appointment"

/** Prescriptions are editable only while the attendance is in progress. */
export function canEditPrescription(status: AppointmentStatus): boolean {
  return status === "checked_in"
}
