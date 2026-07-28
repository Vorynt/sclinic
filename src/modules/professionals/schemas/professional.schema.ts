import { z } from "zod"

import {
  PROFESSIONAL_ROLE_KEYS,
  TREATMENT_PRONOUN_KEYS,
} from "@/modules/professionals/constants/professionals"
import { listQuerySchema } from "@/shared/validators"

const professionalRoleKeySchema = z.enum(PROFESSIONAL_ROLE_KEYS)

const treatmentPronounSchema = z.enum(TREATMENT_PRONOUN_KEYS)

const affiliationTypeSchema = z.enum([
  "attending",
  "coordinator",
  "locum",
  "resident",
])

const professionalStatusSchema = z.enum(["active", "inactive"])

const councilTypeSchema = z.enum(["CRM", "CRO", "COREN", "CRF", "OTHER"])

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const optionalCouncilType = z
  .union([councilTypeSchema, z.literal("").transform(() => undefined)])
  .optional()

const optionalTreatmentPronoun = z
  .union([treatmentPronounSchema, z.literal("").transform(() => undefined)])
  .optional()

export const professionalIdSchema = z.string().uuid("ID inválido")

export const createProfessionalSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .transform((value) => value.toLowerCase()),
  roleKey: professionalRoleKeySchema,
  affiliationType: affiliationTypeSchema,
})

export const updateProfessionalSchema = z
  .object({
    id: professionalIdSchema,
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres")
      .optional(),
    fullName: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres")
      .optional(),
    treatmentPronoun: optionalTreatmentPronoun,
    specialty: optionalTrimmed,
    affiliationType: affiliationTypeSchema.optional(),
    status: professionalStatusSchema.optional(),
    councilType: optionalCouncilType,
    councilNumber: optionalTrimmed,
    councilState: z
      .string()
      .trim()
      .transform((value) => (value.length === 0 ? undefined : value.toUpperCase()))
      .pipe(
        z
          .string()
          .length(2, "UF deve ter 2 caracteres")
          .optional(),
      )
      .optional(),
    biography: optionalTrimmed,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.fullName !== undefined ||
      data.treatmentPronoun !== undefined ||
      data.specialty !== undefined ||
      data.affiliationType !== undefined ||
      data.status !== undefined ||
      data.councilType !== undefined ||
      data.councilNumber !== undefined ||
      data.councilState !== undefined ||
      data.biography !== undefined,
    {
      message: "Informe ao menos um campo para atualizar",
      path: ["_form"],
    },
  )

export const setProfessionalStatusSchema = z.object({
  id: professionalIdSchema,
  status: professionalStatusSchema,
})

export const deleteProfessionalSchema = z.object({
  id: professionalIdSchema,
})

export const listProfessionalsSchema = listQuerySchema

export const listProfessionalsForSchedulingSchema = z.object({
  q: optionalTrimmed,
})

export const professionalInviteTokenSchema = z.object({
  token: z.string().trim().min(1, "Link do convite inválido"),
})

export const updateProfessionalInviteProfileSchema = z.object({
  token: z.string().trim().min(1, "Link do convite inválido"),
  fullName: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  treatmentPronoun: treatmentPronounSchema,
  councilType: optionalCouncilType,
  councilNumber: optionalTrimmed,
  councilState: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value.toUpperCase()))
    .pipe(z.string().length(2, "UF deve ter 2 caracteres").optional())
    .optional(),
  specialty: optionalTrimmed,
  biography: optionalTrimmed,
})

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>
export type SetProfessionalStatusInput = z.infer<
  typeof setProfessionalStatusSchema
>
export type DeleteProfessionalInput = z.infer<typeof deleteProfessionalSchema>
export type ListProfessionalsInput = z.infer<typeof listProfessionalsSchema>
export type ListProfessionalsForSchedulingInput = z.infer<
  typeof listProfessionalsForSchedulingSchema
>
export type ProfessionalInviteTokenInput = z.infer<
  typeof professionalInviteTokenSchema
>
export type UpdateProfessionalInviteProfileInput = z.infer<
  typeof updateProfessionalInviteProfileSchema
>
