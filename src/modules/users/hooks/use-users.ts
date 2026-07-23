import { useQuery } from "@tanstack/react-query"

import { usersQueries } from "@/modules/users/queries/users.query"

export function useMembersQuery() {
  return useQuery(usersQueries.members())
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
