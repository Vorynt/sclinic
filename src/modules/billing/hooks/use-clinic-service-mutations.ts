"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clinicServicesMutations } from "@/modules/billing/mutations/clinic-services.mutation"
import { clinicServicesQueryKeys } from "@/modules/billing/queries/clinic-services.query"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
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

export function useCreateClinicServiceMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicService> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicServicesMutations.create(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: clinicServicesQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdateClinicServiceMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicService> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicServicesMutations.update(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: clinicServicesQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeleteClinicServiceMutation({
  onSuccess,
  onError,
}: MutationCallbacks<void> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicServicesMutations.delete(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: clinicServicesQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
