import { queryOptions } from "@tanstack/react-query"

import type { ListQueryParams } from "@/hooks/use-list-query-params"
import { getInviteAccessAction } from "@/modules/users/actions/get-invite-access"
import { listAssignableRolesAction } from "@/modules/users/actions/list-assignable-roles"
import { listInvitationsAction } from "@/modules/users/actions/list-invitations"
import { listMembersAction } from "@/modules/users/actions/list-members"
import { unwrapActionResult } from "@/shared/errors"

export const usersQueryKeys = {
  all: ["users"] as const,
  members: () => [...usersQueryKeys.all, "members"] as const,
  membersList: (filters?: Record<string, unknown>) =>
    [...usersQueryKeys.members(), filters ?? {}] as const,
  invitations: () => [...usersQueryKeys.all, "invitations"] as const,
  roles: () => [...usersQueryKeys.all, "roles"] as const,
  inviteAccess: (token: string) =>
    [...usersQueryKeys.all, "invite-access", token] as const,
}

export const usersQueries = {
  members: (filters?: ListQueryParams) =>
    queryOptions({
      queryKey: usersQueryKeys.membersList(filters),
      queryFn: async () =>
        unwrapActionResult(await listMembersAction(filters)),
    }),

  invitations: () =>
    queryOptions({
      queryKey: usersQueryKeys.invitations(),
      queryFn: async () => unwrapActionResult(await listInvitationsAction()),
    }),

  assignableRoles: () =>
    queryOptions({
      queryKey: usersQueryKeys.roles(),
      queryFn: async () =>
        unwrapActionResult(await listAssignableRolesAction()),
    }),

  inviteAccess: (token: string) =>
    queryOptions({
      queryKey: usersQueryKeys.inviteAccess(token),
      queryFn: async () =>
        unwrapActionResult(await getInviteAccessAction({ token })),
    }),
}
