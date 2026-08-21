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

export const PAYMENT_METHODS = [
  ...MANUAL_PAYMENT_METHODS,
  "gateway",
  "courtesy",
] as const

export const chargeIdSchema = z.string().uuid("ID inválido")

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_RE.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const utc = new Date(Date.UTC(year, month - 1, day))
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  )
}

const optionalIsoDate = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || isValidIsoDate(value), {
    message: "Data inválida",
  })
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const chargeFilterFields = {
  status: z.enum(CHARGE_STATUSES).optional(),
  overdue: z.coerce.boolean().optional(),
  from: optionalIsoDate,
  to: optionalIsoDate,
  periodAll: z.coerce.boolean().optional(),
  serviceId: z.string().uuid("Serviço inválido").optional(),
  billingKind: z.enum(BILLING_KINDS).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  patientId: z.string().uuid("Paciente inválido").optional(),
}

function refineChargePeriod(
  data: { from?: string; to?: string },
  ctx: z.RefinementCtx,
) {
  if (data.from && data.to && data.from > data.to) {
    ctx.addIssue({
      code: "custom",
      message: "A data inicial deve ser anterior à data final.",
      path: ["from"],
    })
  }
}

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

export const billingInsightsSchema = z
  .object({
    q: optionalTrimmed,
    ...chargeFilterFields,
  })
  .superRefine(refineChargePeriod)

export const listChargesSchema = listQuerySchema
  .extend(chargeFilterFields)
  .superRefine(refineChargePeriod)

export const exportChargesSchema = billingInsightsSchema

export const getChargeByAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Agendamento inválido"),
})

export type CreateChargeFromAppointmentInput = z.infer<
  typeof createChargeFromAppointmentSchema
>
export type MarkChargePaidInput = z.infer<typeof markChargePaidSchema>
export type CancelChargeInput = z.infer<typeof cancelChargeSchema>
export type ListChargesInput = z.infer<typeof listChargesSchema>
export type BillingInsightsInput = z.infer<typeof billingInsightsSchema>
export type ExportChargesInput = z.infer<typeof exportChargesSchema>
export type GetChargeByAppointmentInput = z.infer<
  typeof getChargeByAppointmentSchema
>
