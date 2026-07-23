import { queryOptions } from "@tanstack/react-query"

import { getProfessionalAction } from "@/modules/professionals/actions/get-professional"
import { getProfessionalInvitePreviewAction } from "@/modules/professionals/actions/get-professional-invite-preview"
import { listProfessionalsAction } from "@/modules/professionals/actions/list-professionals"
import { listProfessionalsForSchedulingAction } from "@/modules/professionals/actions/list-professionals-for-scheduling"
import { unwrapActionResult } from "@/shared/errors"

export const professionalsQueryKeys = {
  all: ["professionals"] as const,
  lists: () => [...professionalsQueryKeys.all, "list"] as const,
  list: () => [...professionalsQueryKeys.lists()] as const,
  scheduling: () => [...professionalsQueryKeys.all, "scheduling"] as const,
  details: () => [...professionalsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...professionalsQueryKeys.details(), id] as const,
  invitePreview: (token: string) =>
    [...professionalsQueryKeys.all, "invite-preview", token] as const,
}

export const professionalsQueries = {
  list: () =>
    queryOptions({
      queryKey: professionalsQueryKeys.list(),
      queryFn: async () =>
        unwrapActionResult(await listProfessionalsAction()),
    }),

  scheduling: () =>
    queryOptions({
      queryKey: professionalsQueryKeys.scheduling(),
      queryFn: async () =>
        unwrapActionResult(await listProfessionalsForSchedulingAction()),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: professionalsQueryKeys.detail(id),
      queryFn: async () =>
        unwrapActionResult(await getProfessionalAction(id)),
    }),

  invitePreview: (token: string) =>
    queryOptions({
      queryKey: professionalsQueryKeys.invitePreview(token),
      queryFn: async () =>
        unwrapActionResult(
          await getProfessionalInvitePreviewAction({ token }),
        ),
    }),
}
