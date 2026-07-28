import type {
  CreatePrescriptionInput,
  CreatePrescriptionLayoutInput,
  DeletePrescriptionDraftInput,
  DeletePrescriptionLayoutInput,
  GetPrescriptionInput,
  GetPrescriptionLayoutByIdInput,
  IssuePrescriptionInput,
  ListAppointmentPrescriptionsInput,
  ListPatientPrescriptionsInput,
  SetDefaultPrescriptionLayoutInput,
  UpdatePrescriptionDraftInput,
  UpdatePrescriptionLayoutInput,
} from "@/modules/medical-records/schemas/prescription.schema"

export type CreatePrescriptionDto = CreatePrescriptionInput
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
