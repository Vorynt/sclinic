import { z } from "zod"

import { listQuerySchema } from "@/shared/validators"

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

export const MANUAL_PAYMENT_METHODS = [
  "cash",
  "pix_manual",
  "card",
  "transfer",
  "other",
] as const

export const CHARGE_STATUSES = [
  "pending",
  "paid",
  "canceled",
  "failed",
] as const

export const chargeIdSchema = z.string().uuid("ID inválido")

export const createChargeFromAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Agendamento inválido"),
  amountCents: z.coerce
    .number()
    .int("Valor deve ser um número inteiro em centavos")
    .positive("Valor deve ser maior que zero"),
  description: optionalTrimmed,
})

export const markChargePaidSchema = z.object({
  chargeId: chargeIdSchema,
  /** Manual methods only — `gateway` is rejected until Asaas lands. */
  method: z.enum(MANUAL_PAYMENT_METHODS, {
    message: "Forma de pagamento inválida para registro manual.",
  }),
  paidAt: z.coerce.date().optional(),
  notes: optionalTrimmed,
})

export const cancelChargeSchema = z.object({
  chargeId: chargeIdSchema,
  reason: optionalTrimmed,
})

export const listChargesSchema = listQuerySchema.extend({
  status: z.enum(CHARGE_STATUSES).optional(),
})

export const getChargeByAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Agendamento inválido"),
})

export type CreateChargeFromAppointmentInput = z.infer<
  typeof createChargeFromAppointmentSchema
>
export type MarkChargePaidInput = z.infer<typeof markChargePaidSchema>
export type CancelChargeInput = z.infer<typeof cancelChargeSchema>
export type ListChargesInput = z.infer<typeof listChargesSchema>
export type GetChargeByAppointmentInput = z.infer<
  typeof getChargeByAppointmentSchema
>
