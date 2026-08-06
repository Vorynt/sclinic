import { mutationOptions } from "@tanstack/react-query"

import { cancelWaitlistAction } from "@/modules/appointments/actions/cancel-waitlist"
import { enqueueWaitlistAction } from "@/modules/appointments/actions/enqueue-waitlist"
import { promoteWaitlistAction } from "@/modules/appointments/actions/promote-waitlist"
import type { CancelWaitlistDto } from "@/modules/appointments/dto/cancel-waitlist.dto"
import type { EnqueueWaitlistDto } from "@/modules/appointments/dto/enqueue-waitlist.dto"
import type { PromoteWaitlistDto } from "@/modules/appointments/dto/promote-waitlist.dto"
import { unwrapActionResult } from "@/shared/errors"

export const waitlistMutationKeys = {
  enqueue: ["waitlist", "enqueue"] as const,
  cancel: ["waitlist", "cancel"] as const,
  promote: ["waitlist", "promote"] as const,
}

export const waitlistMutations = {
  enqueue: () =>
    mutationOptions({
      mutationKey: waitlistMutationKeys.enqueue,
      mutationFn: async (data: EnqueueWaitlistDto) =>
        unwrapActionResult(await enqueueWaitlistAction(data)),
    }),

  cancel: () =>
    mutationOptions({
      mutationKey: waitlistMutationKeys.cancel,
      mutationFn: async (data: CancelWaitlistDto) =>
        unwrapActionResult(await cancelWaitlistAction(data)),
    }),

  promote: () =>
    mutationOptions({
      mutationKey: waitlistMutationKeys.promote,
      mutationFn: async (data: PromoteWaitlistDto) =>
        unwrapActionResult(await promoteWaitlistAction(data)),
    }),
}
