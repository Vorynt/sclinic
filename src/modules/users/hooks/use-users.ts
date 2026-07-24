import { useQuery } from "@tanstack/react-query"

import type { ListQueryParams } from "@/hooks/use-list-query-params"
import { usersQueries } from "@/modules/users/queries/users.query"

export function useMembersQuery(
  filters?: ListQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...usersQueries.members(filters),
    ...options,
  })
}

export function useInvitationsQuery() {
  return useQuery(usersQueries.invitations())
}

export function useAssignableRolesQuery() {
  return useQuery(usersQueries.assignableRoles())
}

export function useInviteAccessQuery(token: string) {
  return useQuery({
    ...usersQueries.inviteAccess(token),
    enabled: Boolean(token),
  })
}
