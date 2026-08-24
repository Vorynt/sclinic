"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appointmentsMutations } from "@/modules/appointments/mutations/appointments.mutation"
import { appointmentsQueryKeys } from "@/modules/appointments/queries/appointments.query"
import type {
  Appointment,
  ConfirmAppointmentsBatchResult,
} from "@/modules/appointments/types/appointment"
import { chargesQueryKeys } from "@/modules/billing/queries/charges.query"
import { dashboardQueryKeys } from "@/modules/dashboard/queries/dashboard.query"
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

async function invalidateAppointmentCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  options?: { includeCharges?: boolean },
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: appointmentsQueryKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.all,
    }),
    options?.includeCharges
      ? queryClient.invalidateQueries({
          queryKey: chargesQueryKeys.all,
        })
      : Promise.resolve(),
  ])
}

export function useCreateAppointmentMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Appointment> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.create(),
    onSuccess: async (data) => {
      await invalidateAppointmentCaches(queryClient, { includeCharges: true })
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
      await invalidateAppointmentCaches(queryClient, { includeCharges: true })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useRescheduleAppointmentMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Appointment> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.reschedule(),
    onSuccess: async (data) => {
      await invalidateAppointmentCaches(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdateAppointmentDetailsMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Appointment> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.updateDetails(),
    onSuccess: async (data) => {
      await invalidateAppointmentCaches(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdateAppointmentStatusMutation({
  onSuccess,
  onError,
}: MutationCallbacks<Appointment> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.updateStatus(),
    onSuccess: async (data) => {
      await invalidateAppointmentCaches(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useConfirmAppointmentsBatchMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ConfirmAppointmentsBatchResult> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...appointmentsMutations.confirmBatch(),
    onSuccess: async (data) => {
      await invalidateAppointmentCaches(queryClient)
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
