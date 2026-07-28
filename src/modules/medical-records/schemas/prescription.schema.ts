import { z } from "zod"

export const prescriptionIdSchema = z.string().uuid("ID inválido")
export const appointmentIdSchema = z.string().uuid("ID inválido")
export const patientIdSchema = z.string().uuid("ID inválido")

export const createPrescriptionSchema = z.object({
  appointmentId: appointmentIdSchema,
  body: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  plainText: z.string().trim().min(1, "Escreva o conteúdo da receita."),
})

export const updatePrescriptionDraftSchema = z.object({
  id: prescriptionIdSchema,
  body: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  plainText: z.string().trim().min(1, "Escreva o conteúdo da receita."),
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

export const upsertPrescriptionLayoutSchema = z.object({
  html: z
    .string()
    .trim()
    .min(1, "Informe o HTML do modelo.")
    .max(200_000, "HTML muito longo."),
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
export type UpsertPrescriptionLayoutInput = z.infer<
  typeof upsertPrescriptionLayoutSchema
>
