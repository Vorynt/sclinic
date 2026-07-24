"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clinicalNotesMutations } from "@/modules/medical-records/mutations/clinical-notes.mutation"
import { clinicalNotesQueryKeys } from "@/modules/medical-records/queries/clinical-notes.query"
import type { ClinicalNote } from "@/modules/medical-records/types/clinical-note"
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

export function useUpsertClinicalNoteMutation({
  onSuccess,
  onError,
}: MutationCallbacks<ClinicalNote> = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    ...clinicalNotesMutations.upsert(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: clinicalNotesQueryKeys.all,
      })
      onSuccess?.(data)
    },
    onError: (error) => {
      onError?.(toAppError(error))
    },
  })
}
