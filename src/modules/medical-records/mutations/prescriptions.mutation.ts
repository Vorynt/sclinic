import { mutationOptions } from "@tanstack/react-query"

import { createPrescriptionAction } from "@/modules/medical-records/actions/create-prescription"
import { deletePrescriptionDraftAction } from "@/modules/medical-records/actions/delete-prescription-draft"
import { issuePrescriptionAction } from "@/modules/medical-records/actions/issue-prescription"
import { resetPrescriptionLayoutAction } from "@/modules/medical-records/actions/reset-prescription-layout"
import {
  saveAndIssuePrescriptionAction,
  type SaveAndIssuePrescriptionDto,
} from "@/modules/medical-records/actions/save-and-issue-prescription"
import { updatePrescriptionDraftAction } from "@/modules/medical-records/actions/update-prescription-draft"
import { upsertPrescriptionLayoutAction } from "@/modules/medical-records/actions/upsert-prescription-layout"
import type {
  CreatePrescriptionDto,
  DeletePrescriptionDraftDto,
  IssuePrescriptionDto,
  UpdatePrescriptionDraftDto,
  UpsertPrescriptionLayoutDto,
} from "@/modules/medical-records/dto/prescription.dto"
import { unwrapActionResult } from "@/shared/errors"

export const prescriptionsMutationKeys = {
  create: ["prescriptions", "create"] as const,
  updateDraft: ["prescriptions", "update-draft"] as const,
  issue: ["prescriptions", "issue"] as const,
  saveAndIssue: ["prescriptions", "save-and-issue"] as const,
  deleteDraft: ["prescriptions", "delete-draft"] as const,
  upsertLayout: ["prescriptions", "upsert-layout"] as const,
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

  upsertLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.upsertLayout,
      mutationFn: async (data: UpsertPrescriptionLayoutDto) =>
        unwrapActionResult(await upsertPrescriptionLayoutAction(data)),
    }),

  resetLayout: () =>
    mutationOptions({
      mutationKey: prescriptionsMutationKeys.resetLayout,
      mutationFn: async () =>
        unwrapActionResult(await resetPrescriptionLayoutAction()),
    }),
}
