import type { CreateAppointmentInput } from "@/modules/appointments/schemas/appointment.schema"
import type { Appointment } from "@/modules/appointments/types/appointment"

/** Validated create payload. */
export type CreateAppointmentDto = CreateAppointmentInput

export type CreateAppointmentResult = Appointment
