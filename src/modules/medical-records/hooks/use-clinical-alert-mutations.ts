"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clinicalAlertsMutations } from "@/modules/medical-records/mutations/clinical-alerts.mutation"
import { clinicalAlertsQueryKeys } from "@/modules/medical-records/queries/clinical-alerts.query"
import type { ClinicalAlert } from "@/modules/medical-records/types/clinical-alert"
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

export function useCreateClinicalAlertMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicalAlert> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicalAlertsMutations.create(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: clinicalAlertsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeleteClinicalAlertMutation({
  onSuccess,
  onError,
}: MutationCallbacks<void> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicalAlertsMutations.delete(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: clinicalAlertsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
