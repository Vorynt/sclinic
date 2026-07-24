import type { UpdateAppointmentDetailsInput } from "@/modules/appointments/schemas/appointment.schema"
import type { Appointment } from "@/modules/appointments/types/appointment"

/** Validated update-details payload. */
export type UpdateAppointmentDetailsDto = UpdateAppointmentDetailsInput

export type UpdateAppointmentDetailsResult = Appointment
