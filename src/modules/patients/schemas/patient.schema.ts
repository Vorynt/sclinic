import { z } from "zod"

import { listQuerySchema } from "@/shared/validators"
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

/** Empty string clears the field (stored as null). Not a clinical note. */
const administrativeNotesSchema = z
  .string()
  .trim()
  .max(1000, "Observações administrativas devem ter no máximo 1000 caracteres")
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional()

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .pipe(z.string().email("E-mail inválido").optional())

function optionalString(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
}

const patientAddressFields = {
  addressStreet: optionalString(200, "Rua inválida"),
  addressNumber: optionalString(32, "Número inválido"),
  addressComplement: optionalString(120, "Complemento inválido"),
  addressNeighborhood: optionalString(120, "Bairro inválido"),
  addressCity: optionalString(120, "Cidade inválida"),
  addressState: z
    .string()
    .trim()
    .max(2, "UF inválida")
    .optional()
    .transform((value) => {
      if (!value || value.length === 0) return undefined
      return value.toUpperCase()
    }),
  addressZip: optionalString(16, "CEP inválido"),
}

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
  emergencyContactName: z
    .string()
    .trim()
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional(),
  emergencyContactPhone: optionalTrimmed,
  notes: administrativeNotesSchema,
  ...patientAddressFields,
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
      data.birthDate !== undefined ||
      data.emergencyContactName !== undefined ||
      data.emergencyContactPhone !== undefined ||
      data.notes !== undefined ||
      data.addressStreet !== undefined ||
      data.addressNumber !== undefined ||
      data.addressComplement !== undefined ||
      data.addressNeighborhood !== undefined ||
      data.addressCity !== undefined ||
      data.addressState !== undefined ||
      data.addressZip !== undefined,
    {
      message: "Informe ao menos um campo para atualizar",
      path: ["_form"],
    },
  )

export const listPatientsSchema = listQuerySchema

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type ListPatientsInput = z.infer<typeof listPatientsSchema>
