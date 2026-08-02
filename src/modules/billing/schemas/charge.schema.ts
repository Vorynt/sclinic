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

export const BILLING_KINDS = ["standard", "courtesy", "return"] as const

export const chargeIdSchema = z.string().uuid("ID inválido")

export const createChargeFromAppointmentSchema = z
  .object({
    appointmentId: z.string().uuid("Agendamento inválido"),
    serviceId: z.string().uuid("Serviço inválido"),
    discountPercent: z.coerce
      .number()
      .int("Desconto deve ser um número inteiro")
      .min(0, "Desconto mínimo é 0%")
      .max(100, "Desconto máximo é 100%")
      .default(0),
    billingKind: z.enum(BILLING_KINDS).default("standard"),
    /** Absolute final amount; only honored with financial.manage. */
    amountCentsOverride: z.coerce
      .number()
      .int("Valor deve ser um número inteiro em centavos")
      .min(0, "Valor deve ser maior ou igual a zero")
      .optional(),
    description: optionalTrimmed,
  })
  .superRefine((data, ctx) => {
    if (
      data.billingKind !== "standard" &&
      data.amountCentsOverride !== undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Cortesia/retorno não aceita override de valor.",
        path: ["amountCentsOverride"],
      })
    }
  })

export const markChargePaidSchema = z.object({
  chargeId: chargeIdSchema,
  /** Manual methods only — `gateway` / `courtesy` are rejected here. */
  method: z.enum(MANUAL_PAYMENT_METHODS, {
    message: "Forma de pagamento inválida para registro manual.",
  }),
  discountPercent: z.coerce
    .number()
    .int("Desconto deve ser um número inteiro")
    .min(0, "Desconto mínimo é 0%")
    .max(100, "Desconto máximo é 100%")
    .optional(),
  amountCentsOverride: z.coerce
    .number()
    .int("Valor deve ser um número inteiro em centavos")
    .min(0, "Valor deve ser maior ou igual a zero")
    .optional(),
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
