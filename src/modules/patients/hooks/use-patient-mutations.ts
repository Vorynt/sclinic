"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { patientsMutations } from "@/modules/patients/mutations/patients.mutation"
import { patientsQueryKeys } from "@/modules/patients/queries/patients.query"
import type { Patient } from "@/modules/patients/types/patient"
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

export function useCreatePatientMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Patient> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...patientsMutations.create(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: patientsQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdatePatientMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Patient> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...patientsMutations.update(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: patientsQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeletePatientMutation({
  onSuccess,
  onError,
}: MutationCallbacks<void> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...patientsMutations.delete(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: patientsQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
