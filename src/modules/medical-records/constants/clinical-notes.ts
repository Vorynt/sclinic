import type { AppointmentStatus } from "@/modules/appointments/types/appointment"

/** Pause after the last keystroke before background autosave. */
export const CLINICAL_NOTE_AUTOSAVE_DEBOUNCE_MS = 2000

/** Clinical notes are editable only while the attendance is in progress. */
export function canEditClinicalNote(status: AppointmentStatus): boolean {
  return status === "checked_in"
}
