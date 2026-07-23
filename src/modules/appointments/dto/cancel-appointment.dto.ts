import type { CancelAppointmentInput } from "@/modules/appointments/schemas/appointment.schema"
import type { Appointment } from "@/modules/appointments/types/appointment"

/** Validated cancel payload. */
export type CancelAppointmentDto = CancelAppointmentInput

export type CancelAppointmentResult = Appointment
