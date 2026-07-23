import { z } from "zod"

import { isValidCpf, stripCpf } from "@/utils/cpf"

const cpfSchema = z
  .string()
  .trim()
  .min(1, "CPF é obrigatório")
  .transform(stripCpf)
  .refine(isValidCpf, { message: "CPF inválido" })

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(z.string().email("E-mail inválido").optional())

export const patientIdSchema = z.string().uuid("ID inválido")

const patientOptionalFields = {
  phone: optionalTrimmed,
  email: optionalEmail,
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)")
    .optional()
    .or(z.literal("").transform(() => undefined)),
}

export const createPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  cpf: cpfSchema,
  ...patientOptionalFields,
})

export const updatePatientSchema = z
  .object({
    id: patientIdSchema,
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres")
      .optional(),
    cpf: cpfSchema.optional(),
    ...patientOptionalFields,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.cpf !== undefined ||
      data.phone !== undefined ||
      data.email !== undefined ||
      data.birthDate !== undefined,
    {
      message: "Informe ao menos um campo para atualizar",
      path: ["_form"],
    },
  )

export const listPatientsSchema = z.object({
  q: optionalTrimmed,
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type ListPatientsInput = z.infer<typeof listPatientsSchema>
