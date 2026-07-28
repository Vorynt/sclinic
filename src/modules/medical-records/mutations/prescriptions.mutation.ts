import { mutationOptions } from "@tanstack/react-query"

import { createPrescriptionAction } from "@/modules/medical-records/actions/create-prescription"
import { createPrescriptionLayoutAction } from "@/modules/medical-records/actions/create-prescription-layout"
import { deletePrescriptionDraftAction } from "@/modules/medical-records/actions/delete-prescription-draft"
import { deletePrescriptionLayoutAction } from "@/modules/medical-records/actions/delete-prescription-layout"
import { issuePrescriptionAction } from "@/modules/medical-records/actions/issue-prescription"
import { resetPrescriptionLayoutAction } from "@/modules/medical-records/actions/reset-prescription-layout"
import {
  saveAndIssuePrescriptionAction,
  type SaveAndIssuePrescriptionDto,
} from "@/modules/medical-records/actions/save-and-issue-prescription"
import { setDefaultPrescriptionLayoutAction } from "@/modules/medical-records/actions/set-default-prescription-layout"
import { updatePrescriptionDraftAction } from "@/modules/medical-records/actions/update-prescription-draft"
import { updatePrescriptionLayoutAction } from "@/modules/medical-records/actions/update-prescription-layout"
import type {
  CreatePrescriptionDto,
  CreatePrescriptionLayoutDto,
  DeletePrescriptionDraftDto,
  DeletePrescriptionLayoutDto,
  IssuePrescriptionDto,
  SetDefaultPrescriptionLayoutDto,
  UpdatePrescriptionDraftDto,
  UpdatePrescriptionLayoutDto,
} from "@/modules/medical-records/dto/prescription.dto"
import { unwrapActionResult } from "@/shared/errors"

export const prescriptionsMutationKeys = {
  create: ["prescriptions", "create"] as const,
  updateDraft: ["prescriptions", "update-draft"] as const,
  issue: ["prescriptions", "issue"] as const,
  saveAndIssue: ["prescriptions", "save-and-issue"] as const,
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

  updateDraft: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.updateDraft,
      mutationFn: async (data: UpdatePrescriptionDraftDto) =>
        unwrapActionResult(await updatePrescriptionDraftAction(data)),
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
