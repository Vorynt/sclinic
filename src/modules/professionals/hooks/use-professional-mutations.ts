"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { professionalsMutations } from "@/modules/professionals/mutations/professionals.mutation"
import { professionalsQueryKeys } from "@/modules/professionals/queries/professionals.query"
import type {
  ProfessionalInvitePreview,
  ProfessionalListItem,
} from "@/modules/professionals/types/professional"
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

export function useCreateProfessionalMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ProfessionalListItem> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalsMutations.create(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: professionalsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdateProfessionalMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ProfessionalListItem> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalsMutations.update(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: professionalsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useSetProfessionalStatusMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ProfessionalListItem> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalsMutations.setStatus(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: professionalsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useDeleteProfessionalMutation({
  onSuccess,
  onError,
}: MutationCallbacks<void> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalsMutations.delete(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: professionalsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useUpdateProfessionalInviteProfileMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ProfessionalInvitePreview> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalsMutations.updateInviteProfile(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: professionalsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}

export function useAcceptProfessionalInviteMutation({
  onSuccess,
  onError,
}: MutationCallbacks<{ success: true }> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...professionalsMutations.acceptInvite(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: professionalsQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
