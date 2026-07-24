import { z } from "zod"

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

export const appointmentTypeSchema = z.enum([
  "consultation",
  "follow_up",
  "procedure",
  "evaluation",
  "other",
])

const MAX_APPOINTMENT_DURATION_MS = 8 * 60 * 60 * 1000

export const appointmentIdSchema = z.string().uuid("ID inválido")

export const listAppointmentsSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((data) => data.from < data.to, {
    message: "A data inicial deve ser anterior à data final.",
    path: ["to"],
  })

export const createAppointmentSchema = z
  .object({
    patientId: z.string().uuid("Paciente inválido"),
    professionalId: z.string().uuid("Profissional inválido"),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    type: appointmentTypeSchema.default("consultation"),
    reason: optionalTrimmed,
    notes: optionalTrimmed,
  })
  .refine((data) => data.startsAt.getTime() > Date.now(), {
    message: "Não é possível agendar para um horário no passado.",
    path: ["startsAt"],
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "O horário final deve ser depois do horário inicial.",
    path: ["endsAt"],
  })
  .refine(
    (data) =>
      data.endsAt.getTime() - data.startsAt.getTime() <=
      MAX_APPOINTMENT_DURATION_MS,
    {
      message: "A duração do agendamento não pode exceder 8 horas.",
      path: ["endsAt"],
    },
  )

export const cancelAppointmentSchema = z.object({
  id: appointmentIdSchema,
  canceledReason: optionalTrimmed,
})

/** Empty string clears the field (stored as null). */
const nullableTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional()

export const rescheduleAppointmentSchema = z
  .object({
    id: appointmentIdSchema,
    professionalId: z.string().uuid("Profissional inválido"),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((data) => data.startsAt.getTime() > Date.now(), {
    message: "Não é possível remarcar para um horário no passado.",
    path: ["startsAt"],
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "O horário final deve ser depois do horário inicial.",
    path: ["endsAt"],
  })
  .refine(
    (data) =>
      data.endsAt.getTime() - data.startsAt.getTime() <=
      MAX_APPOINTMENT_DURATION_MS,
    {
      message: "A duração do agendamento não pode exceder 8 horas.",
      path: ["endsAt"],
    },
  )

export const updateAppointmentDetailsSchema = z.object({
  id: appointmentIdSchema,
  type: appointmentTypeSchema,
  reason: nullableTrimmed,
  notes: nullableTrimmed,
})

export const appointmentStatusTransitionSchema = z.enum([
  "confirmed",
  "no_show",
  "checked_in",
  "completed",
])

export const updateAppointmentStatusSchema = z.object({
  id: appointmentIdSchema,
  status: appointmentStatusTransitionSchema,
})

export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>
export type UpdateAppointmentDetailsInput = z.infer<
  typeof updateAppointmentDetailsSchema
>
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>
