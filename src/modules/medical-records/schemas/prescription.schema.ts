import { z } from "zod"

import { prescriptionDocumentModelSchema } from "@/modules/medical-records/prescription-template-designer"

export const prescriptionIdSchema = z.string().uuid("ID inválido")
export const appointmentIdSchema = z.string().uuid("ID inválido")
export const patientIdSchema = z.string().uuid("ID inválido")
export const layoutIdSchema = z.string().uuid("Modelo inválido")

export const createPrescriptionSchema = z.object({
  appointmentId: appointmentIdSchema,
  body: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  plainText: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  layoutId: layoutIdSchema.nullable().optional(),
})

export const updatePrescriptionDraftSchema = z.object({
  id: prescriptionIdSchema,
  body: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  plainText: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  layoutId: layoutIdSchema.nullable().optional(),
})

export const issuePrescriptionSchema = z.object({
  id: prescriptionIdSchema,
})

export const deletePrescriptionDraftSchema = z.object({
  id: prescriptionIdSchema,
})

export const listAppointmentPrescriptionsSchema = z.object({
  appointmentId: appointmentIdSchema,
})

export const listPatientPrescriptionsSchema = z.object({
  patientId: patientIdSchema,
  excludeAppointmentId: appointmentIdSchema.optional(),
})

export const getPrescriptionSchema = z.object({
  id: prescriptionIdSchema,
})

export const createPrescriptionLayoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do modelo.")
    .max(80, "Nome muito longo."),
  documentModel: prescriptionDocumentModelSchema,
  isDefault: z.boolean().optional(),
})

export const updatePrescriptionLayoutSchema = z.object({
  id: layoutIdSchema,
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do modelo.")
    .max(80, "Nome muito longo."),
  documentModel: prescriptionDocumentModelSchema,
})

export const setDefaultPrescriptionLayoutSchema = z.object({
  id: layoutIdSchema,
})

export const deletePrescriptionLayoutSchema = z.object({
  id: layoutIdSchema,
})

export const getPrescriptionLayoutByIdSchema = z.object({
  id: layoutIdSchema,
})

/** @deprecated Prefer create/update schemas — kept for transitional tests. */
export const upsertPrescriptionLayoutSchema = z.object({
  html: z
    .string()
    .trim()
    .min(1, "Informe o conteúdo do modelo.")
    .max(200_000, "Modelo muito longo."),
})

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>
export type UpdatePrescriptionDraftInput = z.infer<
  typeof updatePrescriptionDraftSchema
>
export type IssuePrescriptionInput = z.infer<typeof issuePrescriptionSchema>
export type DeletePrescriptionDraftInput = z.infer<
  typeof deletePrescriptionDraftSchema
>
export type ListAppointmentPrescriptionsInput = z.infer<
  typeof listAppointmentPrescriptionsSchema
>
export type ListPatientPrescriptionsInput = z.infer<
  typeof listPatientPrescriptionsSchema
>
export type GetPrescriptionInput = z.infer<typeof getPrescriptionSchema>
export type CreatePrescriptionLayoutInput = z.infer<
  typeof createPrescriptionLayoutSchema
>
export type UpdatePrescriptionLayoutInput = z.infer<
  typeof updatePrescriptionLayoutSchema
>
export type SetDefaultPrescriptionLayoutInput = z.infer<
  typeof setDefaultPrescriptionLayoutSchema
>
export type DeletePrescriptionLayoutInput = z.infer<
  typeof deletePrescriptionLayoutSchema
>
export type GetPrescriptionLayoutByIdInput = z.infer<
  typeof getPrescriptionLayoutByIdSchema
>
export type UpsertPrescriptionLayoutInput = z.infer<
  typeof upsertPrescriptionLayoutSchema
>
