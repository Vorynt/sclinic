import { z } from "zod"

export const appointmentIdSchema = z.string().uuid("ID inválido")

export const tipTapDocSchema = z
  .object({
    type: z.literal("doc"),
  })
  .passthrough()

export const upsertClinicalNoteSchema = z.object({
  appointmentId: appointmentIdSchema,
  content: tipTapDocSchema,
  plainText: z
    .string()
    .trim()
    .min(1, "A anotação não pode estar vazia"),
})

export const listPatientClinicalNotesSchema = z.object({
  appointmentId: appointmentIdSchema,
})
