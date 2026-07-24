import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appointmentsQueryKeys } from "@/modules/appointments/queries/appointments.query"
import { authQueryKeys } from "@/modules/authentication/queries/auth.query"
import type { DeleteClinicResult } from "@/modules/clinics/dto/delete-clinic.dto"
import { clinicMutations } from "@/modules/clinics/mutations/clinics.mutation"
import { clinicsQueryKeys } from "@/modules/clinics/queries/clinics.query"
import type { Clinic } from "@/modules/clinics/types/clinic"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
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

export function useUpdateClinicMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Clinic> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicMutations.update(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: clinicsQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpsertClinicHoursMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicWeeklyHours> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicMutations.upsertHours(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: clinicsQueryKeys.hours })
      await queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.calendarHours(),
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useApplyDefaultClinicHoursMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicWeeklyHours> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicMutations.applyDefaultHours(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: clinicsQueryKeys.hours })
      await queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.calendarHours(),
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeleteClinicMutation({
  onSuccess,
  onError,
}: MutationCallbacks<DeleteClinicResult> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicMutations.delete(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      await queryClient.invalidateQueries({ queryKey: clinicsQueryKeys.all })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
