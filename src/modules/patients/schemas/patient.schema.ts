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

const addressSchema = z.object({
  addressStreet: optionalTrimmed,
  addressNumber: optionalTrimmed,
  addressComplement: optionalTrimmed,
  addressNeighborhood: optionalTrimmed,
  addressCity: optionalTrimmed,
  addressState: z
    .string()
    .trim()
    .length(2, "UF deve ter 2 caracteres")
    .transform((value) => value.toUpperCase())
    .optional()
    .or(z.literal("").transform(() => undefined)),
  addressZip: optionalTrimmed,
})

export const patientGenderSchema = z.enum([
  "female",
  "male",
  "other",
  "undisclosed",
])

export const patientIdSchema = z.string().trim().min(1, "ID inválido")

const patientProfileFields = {
  socialName: optionalTrimmed,
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  phone: optionalTrimmed,
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  gender: patientGenderSchema.optional(),
  emergencyContactName: optionalTrimmed,
  emergencyContactPhone: optionalTrimmed,
  notes: optionalTrimmed,
  ...addressSchema.shape,
}

export const createPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  cpf: cpfSchema,
  ...patientProfileFields,
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
    ...patientProfileFields,
  })
  .refine(
    (data) => {
      const { id: _id, ...rest } = data
      return Object.values(rest).some((value) => value !== undefined)
    },
    {
      message: "Informe ao menos um campo para atualizar",
      path: ["_form"],
    },
  )

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type PatientGender = z.infer<typeof patientGenderSchema>
