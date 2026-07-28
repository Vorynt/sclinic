import { z } from "zod"

import { createOwnerClinicalProfileSchema } from "@/modules/professionals/schemas/owner-clinical-profile.schema"

function optionalString(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
}

const clinicBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da clínica é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  tradeName: optionalString(
    200,
    "Nome fantasia deve ter no máximo 200 caracteres",
  ),
  document: optionalString(18, "CNPJ/CPF inválido"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.string().email("E-mail inválido").optional()),
  phone: optionalString(32, "Telefone inválido"),
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
  planId: z.string().uuid("Plano inválido"),
  alsoPractices: z.boolean().default(false),
  clinicalPracticeType:
    createOwnerClinicalProfileSchema.shape.clinicalPracticeType.optional(),
  fullName: createOwnerClinicalProfileSchema.shape.fullName.optional(),
  treatmentPronoun:
    createOwnerClinicalProfileSchema.shape.treatmentPronoun.optional(),
  councilType: createOwnerClinicalProfileSchema.shape.councilType.optional(),
  councilNumber:
    createOwnerClinicalProfileSchema.shape.councilNumber.optional(),
  councilState: createOwnerClinicalProfileSchema.shape.councilState.optional(),
  specialty: createOwnerClinicalProfileSchema.shape.specialty.optional(),
})

export const createClinicSchema = clinicBaseSchema.superRefine((data, ctx) => {
  if (!data.alsoPractices) return

  const profile = createOwnerClinicalProfileSchema.safeParse({
    clinicalPracticeType: data.clinicalPracticeType,
    fullName: data.fullName,
    treatmentPronoun: data.treatmentPronoun,
    councilType: data.councilType,
    councilNumber: data.councilNumber,
    councilState: data.councilState,
    specialty: data.specialty,
  })

  if (profile.success) return

  for (const issue of profile.error.issues) {
    ctx.addIssue({
      code: "custom",
      message: issue.message,
      path: issue.path,
    })
  }
})

export type CreateClinicInput = z.infer<typeof createClinicSchema>

export type ClinicCreateFields = Omit<
  CreateClinicInput,
  | "alsoPractices"
  | "clinicalPracticeType"
  | "fullName"
  | "treatmentPronoun"
  | "councilType"
  | "councilNumber"
  | "councilState"
  | "specialty"
>

export function toClinicCreateFields(data: CreateClinicInput): ClinicCreateFields {
  return {
    name: data.name,
    tradeName: data.tradeName,
    document: data.document,
    email: data.email,
    phone: data.phone,
    addressStreet: data.addressStreet,
    addressNumber: data.addressNumber,
    addressComplement: data.addressComplement,
    addressNeighborhood: data.addressNeighborhood,
    addressCity: data.addressCity,
    addressState: data.addressState,
    addressZip: data.addressZip,
    planId: data.planId,
  }
}

export function toOwnerClinicalProfileFields(data: CreateClinicInput) {
  if (!data.alsoPractices) return null
  return createOwnerClinicalProfileSchema.parse({
    clinicalPracticeType: data.clinicalPracticeType,
    fullName: data.fullName,
    treatmentPronoun: data.treatmentPronoun,
    councilType: data.councilType,
    councilNumber: data.councilNumber,
    councilState: data.councilState,
    specialty: data.specialty,
  })
}

export const getClinicSchema = z.object({
  clinicId: z.string().uuid("Clínica inválida"),
})

export const listClinicsByIdsSchema = z.object({
  clinicIds: z
    .array(z.string().uuid("Clínica inválida"))
    .max(50, "Máximo de 50 clínicas por consulta"),
})

export type GetClinicInput = z.infer<typeof getClinicSchema>
export type ListClinicsByIdsInput = z.infer<typeof listClinicsByIdsSchema>

export const updateClinicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da clínica é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  tradeName: optionalString(
    200,
    "Nome fantasia deve ter no máximo 200 caracteres",
  ),
  document: optionalString(18, "CNPJ/CPF inválido"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.string().email("E-mail inválido").optional()),
  phone: optionalString(32, "Telefone inválido"),
  website: optionalString(200, "Website inválido"),
  timezone: z
    .string()
    .trim()
    .min(1, "Fuso horário é obrigatório")
    .max(64, "Fuso horário inválido"),
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
})

export type UpdateClinicInput = z.infer<typeof updateClinicSchema>

export const deleteClinicSchema = z.object({
  confirmationName: z
    .string()
    .trim()
    .min(1, "Digite o nome da clínica para confirmar"),
})

export type DeleteClinicInput = z.infer<typeof deleteClinicSchema>
