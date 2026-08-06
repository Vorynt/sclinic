import type {
  CreateAttendanceDeclarationInput,
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
  SetDefaultPrescriptionLayoutInput,
  UpdateAttendanceDeclarationDraftInput,
  UpdatePrescriptionDraftInput,
  UpdatePrescriptionLayoutInput,
} from "@/modules/medical-records/schemas/prescription.schema"

export type CreatePrescriptionDto = CreatePrescriptionInput
export type CreateAttendanceDeclarationDto = CreateAttendanceDeclarationInput
export type UpdateAttendanceDeclarationDraftDto =
  UpdateAttendanceDeclarationDraftInput
export type SaveAndIssueAttendanceDeclarationDto =
  SaveAndIssueAttendanceDeclarationInput
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
