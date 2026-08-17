import type { z } from "zod"

import {
  createExamRequestSchema,
  saveAndIssueExamRequestSchema,
  updateExamRequestDraftSchema,
} from "@/modules/medical-records/schemas/prescription.schema"
import type {
  CreateAttendanceDeclarationInput,
  CreateExamRequestInput,
  CreateMedicalCertificateInput,
  CreatePrescriptionInput,
  CreatePrescriptionLayoutInput,
  DeletePrescriptionDraftInput,
  DeletePrescriptionLayoutInput,
  GetPrescriptionInput,
  GetPrescriptionLayoutByIdInput,
  IssuePrescriptionInput,
  ListAppointmentPrescriptionsInput,
  ListPatientPrescriptionsInput,
  SaveAndIssueAttendanceDeclarationInput,
  SaveAndIssueExamRequestInput,
  SaveAndIssueMedicalCertificateInput,
  SetDefaultPrescriptionLayoutInput,
  UpdateAttendanceDeclarationDraftInput,
  UpdateExamRequestDraftInput,
  UpdateMedicalCertificateDraftInput,
  UpdatePrescriptionDraftInput,
  UpdatePrescriptionLayoutInput,
} from "@/modules/medical-records/schemas/prescription.schema"

export type CreatePrescriptionDto = CreatePrescriptionInput
export type CreateAttendanceDeclarationDto = CreateAttendanceDeclarationInput
export type UpdateAttendanceDeclarationDraftDto =
  UpdateAttendanceDeclarationDraftInput
export type SaveAndIssueAttendanceDeclarationDto =
  SaveAndIssueAttendanceDeclarationInput
export type CreateMedicalCertificateDto = CreateMedicalCertificateInput
export type UpdateMedicalCertificateDraftDto =
  UpdateMedicalCertificateDraftInput
export type SaveAndIssueMedicalCertificateDto =
  SaveAndIssueMedicalCertificateInput
export type CreateExamRequestDto = CreateExamRequestInput
export type UpdateExamRequestDraftDto = UpdateExamRequestDraftInput
export type SaveAndIssueExamRequestDto = SaveAndIssueExamRequestInput
export type CreateExamRequestClientDto = z.input<typeof createExamRequestSchema>
export type UpdateExamRequestDraftClientDto = z.input<
  typeof updateExamRequestDraftSchema
>
export type SaveAndIssueExamRequestClientDto = z.input<
  typeof saveAndIssueExamRequestSchema
>
export type UpdatePrescriptionDraftDto = UpdatePrescriptionDraftInput
export type IssuePrescriptionDto = IssuePrescriptionInput
export type DeletePrescriptionDraftDto = DeletePrescriptionDraftInput
export type ListAppointmentPrescriptionsDto = ListAppointmentPrescriptionsInput
export type ListPatientPrescriptionsDto = ListPatientPrescriptionsInput
export type GetPrescriptionDto = GetPrescriptionInput
export type CreatePrescriptionLayoutDto = CreatePrescriptionLayoutInput
export type UpdatePrescriptionLayoutDto = UpdatePrescriptionLayoutInput
export type SetDefaultPrescriptionLayoutDto = SetDefaultPrescriptionLayoutInput
export type DeletePrescriptionLayoutDto = DeletePrescriptionLayoutInput
export type GetPrescriptionLayoutByIdDto = GetPrescriptionLayoutByIdInput
