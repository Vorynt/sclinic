import type {
  CreatePrescriptionInput,
  DeletePrescriptionDraftInput,
  GetPrescriptionInput,
  IssuePrescriptionInput,
  ListAppointmentPrescriptionsInput,
  ListPatientPrescriptionsInput,
  UpdatePrescriptionDraftInput,
  UpsertPrescriptionLayoutInput,
} from "@/modules/medical-records/schemas/prescription.schema"

export type CreatePrescriptionDto = CreatePrescriptionInput
export type UpdatePrescriptionDraftDto = UpdatePrescriptionDraftInput
export type IssuePrescriptionDto = IssuePrescriptionInput
export type DeletePrescriptionDraftDto = DeletePrescriptionDraftInput
export type ListAppointmentPrescriptionsDto = ListAppointmentPrescriptionsInput
export type ListPatientPrescriptionsDto = ListPatientPrescriptionsInput
export type GetPrescriptionDto = GetPrescriptionInput
export type UpsertPrescriptionLayoutDto = UpsertPrescriptionLayoutInput
