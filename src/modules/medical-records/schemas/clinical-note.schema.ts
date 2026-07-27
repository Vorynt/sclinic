import { z } from "zod"

import {
  CLINICAL_NOTE_TEMPLATE_IDS,
  getClinicalNoteTemplateOrThrow,
  type ClinicalNoteTemplate,
  type ClinicalNoteTemplateField,
} from "@/modules/medical-records/constants/clinical-note-templates"

export const appointmentIdSchema = z.string().uuid("ID inválido")

export const tipTapDocSchema = z
  .object({
    type: z.literal("doc"),
  })
  .passthrough()

const templateIdSchema = z.enum(CLINICAL_NOTE_TEMPLATE_IDS)

function fieldValueSchema(field: ClinicalNoteTemplateField): z.ZodTypeAny {
  switch (field.type) {
    case "section":
      return z.any().optional()
    case "switch":
      return z.boolean()
    case "checklist": {
      const allowed = (field.options ?? []).map((option) => option.value)
      const base = z.array(z.string()).default([])
      if (allowed.length === 0) return base
      return z
        .array(z.string())
        .default([])
        .superRefine((items, ctx) => {
          for (const item of items) {
            if (!allowed.includes(item)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Opção inválida: ${item}`,
              })
            }
          }
        })
    }
    case "select": {
      const allowed = (field.options ?? []).map((option) => option.value)
      if (field.required) {
        return z
          .string()
          .min(1, `${field.label} é obrigatório`)
          .refine((value) => allowed.includes(value), "Opção inválida")
      }
      return z
        .string()
        .optional()
        .transform((value) => value ?? "")
        .refine(
          (value) => value === "" || allowed.includes(value),
          "Opção inválida",
        )
    }
    case "text":
    case "textarea": {
      if (field.required) {
        return z.string().trim().min(1, `${field.label} é obrigatório`)
      }
      return z
        .string()
        .optional()
        .transform((value) => value?.trim() ?? "")
    }
    default:
      return z.unknown().optional()
  }
}

/** Builds a Zod object schema for a template's fillable fields. */
export function buildTemplateValuesSchema(template: ClinicalNoteTemplate) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of template.fields) {
    if (field.type === "section") continue
    shape[field.id] = fieldValueSchema(field)
  }
  return z.object(shape)
}

/** Upsert via structured clinical form template. */
export const upsertClinicalNoteFormSchema = z
  .object({
    appointmentId: appointmentIdSchema,
    templateId: templateIdSchema,
    formValues: z.record(z.string(), z.unknown()),
  })
  .superRefine((data, ctx) => {
    const template = getClinicalNoteTemplateOrThrow(data.templateId)
    const parsed = buildTemplateValuesSchema(template).safeParse(data.formValues)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: ["formValues", ...issue.path],
        })
      }
    }
  })

/** Legacy TipTap-only upsert (notes without template). */
export const upsertClinicalNoteLegacySchema = z.object({
  appointmentId: appointmentIdSchema,
  content: tipTapDocSchema,
  plainText: z.string().trim().min(1, "A anotação não pode estar vazia"),
})

export const upsertClinicalNoteSchema = z.union([
  upsertClinicalNoteFormSchema,
  upsertClinicalNoteLegacySchema,
])

export const listPatientClinicalNotesSchema = z.object({
  patientId: z.string().uuid("Paciente inválido"),
  excludeAppointmentId: appointmentIdSchema.optional(),
})

export function isFormUpsert(
  data: z.infer<typeof upsertClinicalNoteSchema>,
): data is z.infer<typeof upsertClinicalNoteFormSchema> {
  return "templateId" in data && "formValues" in data
}
