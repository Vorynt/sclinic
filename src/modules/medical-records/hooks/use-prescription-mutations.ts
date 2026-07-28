"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { prescriptionsMutations } from "@/modules/medical-records/mutations/prescriptions.mutation"
import { prescriptionsQueryKeys } from "@/modules/medical-records/queries/prescriptions.query"
import type {
  Prescription,
  PrescriptionLayout,
} from "@/modules/medical-records/types/prescription"
import {
  AppError,
  ErrorCode,
  getClientMessage,
  isAppError,
} from "@/shared/errors"
import type { MutationCallbacks } from "@/types/mutation"

function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  return new AppError(ErrorCode.INTERNAL_ERROR, {
    message: getClientMessage(ErrorCode.INTERNAL_ERROR),
    cause: error,
  })
}

async function invalidatePrescriptionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({
    queryKey: prescriptionsQueryKeys.all,
  })
}

export function useCreatePrescriptionMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Prescription> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.create(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdatePrescriptionDraftMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Prescription> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.updateDraft(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useIssuePrescriptionMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Prescription> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.issue(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useSaveAndIssuePrescriptionMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Prescription> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.saveAndIssue(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeletePrescriptionDraftMutation({
  onSuccess,
  onError,
}: MutationCallbacks<void> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.deleteDraft(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpsertPrescriptionLayoutMutation({
  onSuccess,
  onError,
}: MutationCallbacks<PrescriptionLayout> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.upsertLayout(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useResetPrescriptionLayoutMutation({
  onSuccess,
  onError,
}: MutationCallbacks<void> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...prescriptionsMutations.resetLayout(),
    onSuccess: async (data) => {
      await invalidatePrescriptionQueries(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
