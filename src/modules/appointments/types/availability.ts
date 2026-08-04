/**
 * Input for checking whether a professional can take a time slot.
 * `excludeAppointmentId` supports future update flows (ignore self).
 */
export type ProfessionalAvailabilityInput = {
  clinicId: string
  professionalId: string
  startsAt: Date
  endsAt: Date
  excludeAppointmentId?: string
}

/**
 * Why a slot is unavailable.
 * `outside_working_hours` = outside clinic business hours today.
 * When professionals define their own schedules, that window will be a subset of clinic hours.
 */
export type UnavailabilityReason = "slot_conflict" | "outside_working_hours"

export type ProfessionalAvailabilityResult =
  | { available: true }
  | { available: false; reason: UnavailabilityReason }

/** Busy interval used when suggesting the next free slots. */
export type BusyInterval = {
  startsAt: Date
  endsAt: Date
}

/**
 * Client-safe meta attached to availability errors.
 * `suggestedSlots` are ISO datetimes for candidate `startsAt` values inside clinic hours.
 */
export type AvailabilityErrorMeta = {
  suggestedSlots: string[]
}
