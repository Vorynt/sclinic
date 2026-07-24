import type { RescheduleAppointmentInput } from "@/modules/appointments/schemas/appointment.schema"
import type { Appointment } from "@/modules/appointments/types/appointment"

/** Validated reschedule payload. */
export type RescheduleAppointmentDto = RescheduleAppointmentInput

export type RescheduleAppointmentResult = Appointment
