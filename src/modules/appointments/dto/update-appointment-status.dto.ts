import type { UpdateAppointmentStatusInput } from "@/modules/appointments/schemas/appointment.schema"
import type { Appointment } from "@/modules/appointments/types/appointment"

/** Validated status-transition payload. */
export type UpdateAppointmentStatusDto = UpdateAppointmentStatusInput

export type UpdateAppointmentStatusResult = Appointment
