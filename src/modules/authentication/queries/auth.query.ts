import { queryOptions } from "@tanstack/react-query"

import { getSessionAction } from "@/modules/authentication/actions/get-session"
import { listMembershipsAction } from "@/modules/authentication/actions/list-memberships"
import { listSessionsAction } from "@/modules/authentication/actions/list-sessions"
import { unwrapActionResult } from "@/shared/errors"

export const authQueryKeys = {
  all: ["authentication"] as const,
  session: ["authentication", "session"] as const,
  memberships: ["authentication", "memberships"] as const,
  sessions: ["authentication", "sessions"] as const,
}

export const authQueries = {
  session: () =>
    queryOptions({
      queryKey: authQueryKeys.session,
      queryFn: async () => unwrapActionResult(await getSessionAction()),
    }),

  memberships: () =>
    queryOptions({
      queryKey: authQueryKeys.memberships,
      queryFn: async () => unwrapActionResult(await listMembershipsAction()),
    }),

  sessions: () =>
    queryOptions({
      queryKey: authQueryKeys.sessions,
      queryFn: async () => unwrapActionResult(await listSessionsAction()),
    }),
}
