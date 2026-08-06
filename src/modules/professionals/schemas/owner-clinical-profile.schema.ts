import { z } from "zod"

import {
  PROFESSION_TYPE_KEYS,
  TREATMENT_PRONOUN_KEYS,
} from "@/modules/professionals/constants/professionals"

const professionTypeSchema = z.enum(PROFESSION_TYPE_KEYS)

const treatmentPronounSchema = z.enum(TREATMENT_PRONOUN_KEYS)

const councilTypeSchema = z.enum([
  "CRM",
  "CRO",
  "COREN",
  "CRF",
  "CREFITO",
  "CRP",
  "OTHER",
])

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const optionalCouncilType = z
  .union([councilTypeSchema, z.literal("").transform(() => undefined)])
  .optional()

/**
 * Owner clinical profile (ADR-007 / ADR-012).
 * `professionType` drives UI defaults and is stored on the profile —
 * never changes membership role (stays `owner`).
 */
export const createOwnerClinicalProfileSchema = z.object({
  professionType: professionTypeSchema,
  fullName: z
    .string()
    .trim()
    .min(1, "Nome completo na agenda é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  treatmentPronoun: treatmentPronounSchema,
  councilType: optionalCouncilType,
  councilNumber: optionalTrimmed,
  councilState: z
    .string()
    .trim()
    .transform((value) =>
      value.length === 0 ? undefined : value.toUpperCase(),
    )
    .pipe(z.string().length(2, "UF deve ter 2 caracteres").optional())
    .optional(),
  specialty: optionalTrimmed,
})

export type CreateOwnerClinicalProfileInput = z.infer<
  typeof createOwnerClinicalProfileSchema
>
