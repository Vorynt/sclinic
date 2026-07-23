"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appointmentsMutations } from "@/modules/appointments/mutations/appointments.mutation"
import { appointmentsQueryKeys } from "@/modules/appointments/queries/appointments.query"
import type { Appointment } from "@/modules/appointments/types/appointment"
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

export function useCreateAppointmentMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Appointment> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.create(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useCancelAppointmentMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Appointment> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.cancel(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
