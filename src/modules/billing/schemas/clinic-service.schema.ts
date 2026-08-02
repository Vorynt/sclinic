import { z } from "zod"

import { listQuerySchema } from "@/shared/validators"

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

export const clinicServiceIdSchema = z.string().uuid("ID inválido")

export const createClinicServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .trim()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional(),
  priceCents: z.coerce
    .number()
    .int("Preço deve ser um valor inteiro em centavos")
    .positive("Preço deve ser maior que zero"),
  isActive: z.boolean().default(true),
})

export const updateClinicServiceSchema = z
  .object({
    id: clinicServiceIdSchema,
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Descrição deve ter no máximo 1000 caracteres")
      .transform((value) => (value.length === 0 ? null : value))
      .optional()
      .nullable(),
    priceCents: z.coerce
      .number()
      .int("Preço deve ser um valor inteiro em centavos")
      .positive("Preço deve ser maior que zero")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.priceCents !== undefined ||
      data.isActive !== undefined,
    {
      message: "Informe ao menos um campo para atualizar",
      path: ["_form"],
    },
  )

export const listClinicServicesSchema = listQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
})

export const listActiveClinicServicesSchema = z.object({
  q: optionalTrimmed,
})

export type CreateClinicServiceInput = z.infer<typeof createClinicServiceSchema>
export type UpdateClinicServiceInput = z.infer<typeof updateClinicServiceSchema>
export type ListClinicServicesInput = z.infer<typeof listClinicServicesSchema>
export type ListActiveClinicServicesInput = z.infer<
  typeof listActiveClinicServicesSchema
>
