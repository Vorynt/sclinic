import { z } from "zod"

import { CLINICAL_DOCUMENT_KINDS } from "@/modules/medical-records/constants/clinical-documents"
import { prescriptionDocumentModelSchema } from "@/modules/medical-records/prescription-template-designer"

export const prescriptionIdSchema = z.string().uuid("ID inválido")
export const appointmentIdSchema = z.string().uuid("ID inválido")
export const patientIdSchema = z.string().uuid("ID inválido")
export const layoutIdSchema = z.string().uuid("Modelo inválido")

export const clinicalDocumentKindSchema = z.enum(CLINICAL_DOCUMENT_KINDS)

export const attendanceDeclarationMetadataSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres.")
    .optional()
    .nullable(),
})

export const medicalCertificateMetadataSchema = z.object({
  daysOff: z.coerce
    .number()
    .int("Informe um número inteiro de dias.")
    .min(1, "Informe ao menos 1 dia de afastamento.")
    .max(365, "O afastamento não pode exceder 365 dias."),
  cid: z
    .string()
    .trim()
    .max(10, "CID deve ter no máximo 10 caracteres.")
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres.")
    .optional()
    .nullable(),
})

export const examRequestMetadataSchema = z.object({
  exams: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Cada exame deve ter ao menos 1 caractere.")
        .max(200, "Cada exame deve ter no máximo 200 caracteres."),
    )
    .min(1, "Informe ao menos um exame.")
    .max(50, "Máximo de 50 exames por solicitação."),
  notes: z
    .string()
    .trim()
    .max(1000, "Indicação clínica deve ter no máximo 1000 caracteres.")
    .optional()
    .nullable(),
})

const examsTextFieldSchema = z
  .string()
  .trim()
  .min(1, "Informe ao menos um exame (um por linha).")
  .max(10_000, "Lista de exames muito longa.")

function parseExamsFromText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export const createPrescriptionSchema = z.object({
  appointmentId: appointmentIdSchema,
  body: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  plainText: z.string().trim().min(1, "Escreva o conteúdo da receita."),
  layoutId: layoutIdSchema.nullable().optional(),
})

export const createAttendanceDeclarationSchema = z.object({
  appointmentId: appointmentIdSchema,
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres.")
    .optional()
    .nullable(),
})

export const updateAttendanceDeclarationDraftSchema = z.object({
  id: prescriptionIdSchema,
  notes: z
    .string()
    .trim()
    .max(1000, "Observações devem ter no máximo 1000 caracteres.")
    .optional()
    .nullable(),
})

export const saveAndIssueAttendanceDeclarationSchema =
  createAttendanceDeclarationSchema.extend({
    id: prescriptionIdSchema.optional(),
  })

export const createMedicalCertificateSchema = z.object({
  appointmentId: appointmentIdSchema,
  daysOff: medicalCertificateMetadataSchema.shape.daysOff,
  cid: medicalCertificateMetadataSchema.shape.cid,
  notes: medicalCertificateMetadataSchema.shape.notes,
})

export const updateMedicalCertificateDraftSchema = z.object({
  id: prescriptionIdSchema,
  daysOff: medicalCertificateMetadataSchema.shape.daysOff,
  cid: medicalCertificateMetadataSchema.shape.cid,
  notes: medicalCertificateMetadataSchema.shape.notes,
})

export const saveAndIssueMedicalCertificateSchema =
  createMedicalCertificateSchema.extend({
    id: prescriptionIdSchema.optional(),
  })

export const createExamRequestSchema = z
  .object({
    appointmentId: appointmentIdSchema,
    examsText: examsTextFieldSchema,
    notes: examRequestMetadataSchema.shape.notes,
  })
  .transform((data) => ({
    appointmentId: data.appointmentId,
    exams: parseExamsFromText(data.examsText),
    notes: data.notes?.trim() || null,
  }))

export const updateExamRequestDraftSchema = z
  .object({
    id: prescriptionIdSchema,
    examsText: examsTextFieldSchema,
    notes: examRequestMetadataSchema.shape.notes,
  })
  .transform((data) => ({
    id: data.id,
    exams: parseExamsFromText(data.examsText),
    notes: data.notes?.trim() || null,
  }))

export const saveAndIssueExamRequestSchema = z
  .object({
    appointmentId: appointmentIdSchema,
    id: prescriptionIdSchema.optional(),
    examsText: examsTextFieldSchema,
    notes: examRequestMetadataSchema.shape.notes,
  })
  .transform((data) => ({
    appointmentId: data.appointmentId,
    id: data.id,
    exams: parseExamsFromText(data.examsText),
    notes: data.notes?.trim() || null,
  }))

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
  kind: clinicalDocumentKindSchema.optional(),
})

export const listPatientPrescriptionsSchema = z.object({
  patientId: patientIdSchema,
  excludeAppointmentId: appointmentIdSchema.optional(),
  kind: clinicalDocumentKindSchema.optional(),
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
export type CreateAttendanceDeclarationInput = z.infer<
  typeof createAttendanceDeclarationSchema
>
export type UpdateAttendanceDeclarationDraftInput = z.infer<
  typeof updateAttendanceDeclarationDraftSchema
>
export type SaveAndIssueAttendanceDeclarationInput = z.infer<
  typeof saveAndIssueAttendanceDeclarationSchema
>
export type AttendanceDeclarationMetadata = z.infer<
  typeof attendanceDeclarationMetadataSchema
>
export type CreateMedicalCertificateInput = z.infer<
  typeof createMedicalCertificateSchema
>
export type UpdateMedicalCertificateDraftInput = z.infer<
  typeof updateMedicalCertificateDraftSchema
>
export type SaveAndIssueMedicalCertificateInput = z.infer<
  typeof saveAndIssueMedicalCertificateSchema
>
export type MedicalCertificateMetadata = z.infer<
  typeof medicalCertificateMetadataSchema
>
export type CreateExamRequestInput = z.infer<typeof createExamRequestSchema>
export type UpdateExamRequestDraftInput = z.infer<
  typeof updateExamRequestDraftSchema
>
export type SaveAndIssueExamRequestInput = z.infer<
  typeof saveAndIssueExamRequestSchema
>
export type ExamRequestMetadata = z.infer<typeof examRequestMetadataSchema>
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
