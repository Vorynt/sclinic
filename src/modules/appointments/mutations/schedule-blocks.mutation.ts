import { mutationOptions } from "@tanstack/react-query"

import { createScheduleBlockAction } from "@/modules/appointments/actions/create-schedule-block"
import { deleteScheduleBlockAction } from "@/modules/appointments/actions/delete-schedule-block"
import type { CreateScheduleBlockDto } from "@/modules/appointments/dto/create-schedule-block.dto"
import { unwrapActionResult } from "@/shared/errors"

export const scheduleBlocksMutationKeys = {
  create: ["schedule-blocks", "create"] as const,
  delete: ["schedule-blocks", "delete"] as const,
}

export const scheduleBlocksMutations = {
  create: () =>
    mutationOptions({
      mutationKey: scheduleBlocksMutationKeys.create,
      mutationFn: async (data: CreateScheduleBlockDto) =>
        unwrapActionResult(await createScheduleBlockAction(data)),
    }),

  delete: () =>
    mutationOptions({
      mutationKey: scheduleBlocksMutationKeys.delete,
      mutationFn: async (data: { id: string }) =>
        unwrapActionResult(await deleteScheduleBlockAction(data)),
    }),
}
