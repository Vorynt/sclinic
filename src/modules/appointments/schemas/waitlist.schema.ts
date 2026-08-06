import { z } from "zod"

import { createAppointmentSchema } from "@/modules/appointments/schemas/appointment.schema"

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

export const waitlistIdSchema = z.string().uuid("ID inválido")

export const waitlistStatusSchema = z.enum(["waiting", "promoted", "canceled"])

export const enqueueWaitlistSchema = z.object({
  patientId: z.string().uuid("Paciente inválido"),
  professionalId: z.string().uuid("Profissional inválido").optional(),
  serviceId: z.string().uuid("Serviço inválido").optional(),
  notes: optionalTrimmed,
})

export const listWaitlistSchema = z.object({
  status: waitlistStatusSchema.optional(),
  professionalId: z.string().uuid("Profissional inválido").optional(),
})

export const cancelWaitlistSchema = z.object({
  id: waitlistIdSchema,
})

/**
 * Promotes a waiting entry into a real appointment (ADR-011).
 * `appointment` reuses the same validated shape as a normal booking.
 */
export const promoteWaitlistSchema = z.object({
  waitlistId: waitlistIdSchema,
  appointment: createAppointmentSchema,
})

export type EnqueueWaitlistInput = z.infer<typeof enqueueWaitlistSchema>
export type ListWaitlistInput = z.infer<typeof listWaitlistSchema>
export type CancelWaitlistInput = z.infer<typeof cancelWaitlistSchema>
export type PromoteWaitlistInput = z.infer<typeof promoteWaitlistSchema>
