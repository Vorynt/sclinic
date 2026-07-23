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
 * `outside_working_hours` is reserved for when professionals define schedules.
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
 * Client-safe meta attached to `APPOINTMENT_SLOT_UNAVAILABLE`.
 * `suggestedSlots` are ISO datetimes for candidate `startsAt` values.
 */
export type AvailabilityErrorMeta = {
  suggestedSlots: string[]
}
