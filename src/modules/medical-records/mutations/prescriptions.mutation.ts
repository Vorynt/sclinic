import { mutationOptions } from "@tanstack/react-query"

import { createAttendanceDeclarationAction } from "@/modules/medical-records/actions/create-attendance-declaration"
import { createExamRequestAction } from "@/modules/medical-records/actions/create-exam-request"
import { createMedicalCertificateAction } from "@/modules/medical-records/actions/create-medical-certificate"
import { createPrescriptionAction } from "@/modules/medical-records/actions/create-prescription"
import { createPrescriptionLayoutAction } from "@/modules/medical-records/actions/create-prescription-layout"
import { deletePrescriptionDraftAction } from "@/modules/medical-records/actions/delete-prescription-draft"
import { deletePrescriptionLayoutAction } from "@/modules/medical-records/actions/delete-prescription-layout"
import { issuePrescriptionAction } from "@/modules/medical-records/actions/issue-prescription"
import { resetPrescriptionLayoutAction } from "@/modules/medical-records/actions/reset-prescription-layout"
import { saveAndIssueAttendanceDeclarationAction } from "@/modules/medical-records/actions/save-and-issue-attendance-declaration"
import { saveAndIssueExamRequestAction } from "@/modules/medical-records/actions/save-and-issue-exam-request"
import { saveAndIssueMedicalCertificateAction } from "@/modules/medical-records/actions/save-and-issue-medical-certificate"
import {
  saveAndIssuePrescriptionAction,
  type SaveAndIssuePrescriptionDto,
} from "@/modules/medical-records/actions/save-and-issue-prescription"
import { setDefaultPrescriptionLayoutAction } from "@/modules/medical-records/actions/set-default-prescription-layout"
import { updateAttendanceDeclarationDraftAction } from "@/modules/medical-records/actions/update-attendance-declaration-draft"
import { updateExamRequestDraftAction } from "@/modules/medical-records/actions/update-exam-request-draft"
import { updateMedicalCertificateDraftAction } from "@/modules/medical-records/actions/update-medical-certificate-draft"
import { updatePrescriptionDraftAction } from "@/modules/medical-records/actions/update-prescription-draft"
import { updatePrescriptionLayoutAction } from "@/modules/medical-records/actions/update-prescription-layout"
import type {
  CreateAttendanceDeclarationDto,
  CreateExamRequestClientDto,
  CreateMedicalCertificateDto,
  CreatePrescriptionDto,
  CreatePrescriptionLayoutDto,
  DeletePrescriptionDraftDto,
  DeletePrescriptionLayoutDto,
  IssuePrescriptionDto,
  SaveAndIssueAttendanceDeclarationDto,
  SaveAndIssueExamRequestClientDto,
  SaveAndIssueMedicalCertificateDto,
  SetDefaultPrescriptionLayoutDto,
  UpdateAttendanceDeclarationDraftDto,
  UpdateExamRequestDraftClientDto,
  UpdateMedicalCertificateDraftDto,
  UpdatePrescriptionDraftDto,
  UpdatePrescriptionLayoutDto,
} from "@/modules/medical-records/dto/prescription.dto"
import { unwrapActionResult } from "@/shared/errors"

export const prescriptionsMutationKeys = {
  create: ["prescriptions", "create"] as const,
  createAttendanceDeclaration: [
    "prescriptions",
    "create-attendance-declaration",
  ] as const,
  updateDraft: ["prescriptions", "update-draft"] as const,
  updateAttendanceDeclarationDraft: [
    "prescriptions",
    "update-attendance-declaration-draft",
  ] as const,
  issue: ["prescriptions", "issue"] as const,
  saveAndIssue: ["prescriptions", "save-and-issue"] as const,
  saveAndIssueAttendanceDeclaration: [
    "prescriptions",
    "save-and-issue-attendance-declaration",
  ] as const,
  createMedicalCertificate: [
    "prescriptions",
    "create-medical-certificate",
  ] as const,
  updateMedicalCertificateDraft: [
    "prescriptions",
    "update-medical-certificate-draft",
  ] as const,
  saveAndIssueMedicalCertificate: [
    "prescriptions",
    "save-and-issue-medical-certificate",
  ] as const,
  createExamRequest: ["prescriptions", "create-exam-request"] as const,
  updateExamRequestDraft: [
    "prescriptions",
    "update-exam-request-draft",
  ] as const,
  saveAndIssueExamRequest: [
    "prescriptions",
    "save-and-issue-exam-request",
  ] as const,
  deleteDraft: ["prescriptions", "delete-draft"] as const,
  createLayout: ["prescriptions", "create-layout"] as const,
  updateLayout: ["prescriptions", "update-layout"] as const,
  setDefaultLayout: ["prescriptions", "set-default-layout"] as const,
  deleteLayout: ["prescriptions", "delete-layout"] as const,
  resetLayout: ["prescriptions", "reset-layout"] as const,
}

export const prescriptionsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.create,
      mutationFn: async (data: CreatePrescriptionDto) =>
        unwrapActionResult(await createPrescriptionAction(data)),
    }),

  createAttendanceDeclaration: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.createAttendanceDeclaration,
      mutationFn: async (data: CreateAttendanceDeclarationDto) =>
        unwrapActionResult(await createAttendanceDeclarationAction(data)),
    }),

  updateDraft: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.updateDraft,
      mutationFn: async (data: UpdatePrescriptionDraftDto) =>
        unwrapActionResult(await updatePrescriptionDraftAction(data)),
    }),

  updateAttendanceDeclarationDraft: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.updateAttendanceDeclarationDraft,
      mutationFn: async (data: UpdateAttendanceDeclarationDraftDto) =>
        unwrapActionResult(await updateAttendanceDeclarationDraftAction(data)),
    }),

  issue: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.issue,
      mutationFn: async (data: IssuePrescriptionDto) =>
        unwrapActionResult(await issuePrescriptionAction(data)),
    }),

  saveAndIssue: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.saveAndIssue,
      mutationFn: async (data: SaveAndIssuePrescriptionDto) =>
        unwrapActionResult(await saveAndIssuePrescriptionAction(data)),
    }),

  saveAndIssueAttendanceDeclaration: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.saveAndIssueAttendanceDeclaration,
      mutationFn: async (data: SaveAndIssueAttendanceDeclarationDto) =>
        unwrapActionResult(
          await saveAndIssueAttendanceDeclarationAction(data),
        ),
    }),

  createMedicalCertificate: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.createMedicalCertificate,
      mutationFn: async (data: CreateMedicalCertificateDto) =>
        unwrapActionResult(await createMedicalCertificateAction(data)),
    }),

  updateMedicalCertificateDraft: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.updateMedicalCertificateDraft,
      mutationFn: async (data: UpdateMedicalCertificateDraftDto) =>
        unwrapActionResult(await updateMedicalCertificateDraftAction(data)),
    }),

  saveAndIssueMedicalCertificate: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.saveAndIssueMedicalCertificate,
      mutationFn: async (data: SaveAndIssueMedicalCertificateDto) =>
        unwrapActionResult(await saveAndIssueMedicalCertificateAction(data)),
    }),

  createExamRequest: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.createExamRequest,
      mutationFn: async (data: CreateExamRequestClientDto) =>
        unwrapActionResult(await createExamRequestAction(data)),
    }),

  updateExamRequestDraft: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.updateExamRequestDraft,
      mutationFn: async (data: UpdateExamRequestDraftClientDto) =>
        unwrapActionResult(await updateExamRequestDraftAction(data)),
    }),

  saveAndIssueExamRequest: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.saveAndIssueExamRequest,
      mutationFn: async (data: SaveAndIssueExamRequestClientDto) =>
        unwrapActionResult(await saveAndIssueExamRequestAction(data)),
    }),

  deleteDraft: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.deleteDraft,
      mutationFn: async (data: DeletePrescriptionDraftDto) =>
        unwrapActionResult(await deletePrescriptionDraftAction(data)),
    }),

  createLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.createLayout,
      mutationFn: async (data: CreatePrescriptionLayoutDto) =>
        unwrapActionResult(await createPrescriptionLayoutAction(data)),
    }),

  updateLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.updateLayout,
      mutationFn: async (data: UpdatePrescriptionLayoutDto) =>
        unwrapActionResult(await updatePrescriptionLayoutAction(data)),
    }),

  setDefaultLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.setDefaultLayout,
      mutationFn: async (data: SetDefaultPrescriptionLayoutDto) =>
        unwrapActionResult(await setDefaultPrescriptionLayoutAction(data)),
    }),

  deleteLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.deleteLayout,
      mutationFn: async (data: DeletePrescriptionLayoutDto) =>
        unwrapActionResult(await deletePrescriptionLayoutAction(data)),
    }),

  resetLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.resetLayout,
      mutationFn: async () =>
        unwrapActionResult(await resetPrescriptionLayoutAction()),
    }),
}

