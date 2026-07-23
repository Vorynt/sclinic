import { queryOptions } from "@tanstack/react-query"

import { getInviteAccessAction } from "@/modules/users/actions/get-invite-access"
import { listAssignableRolesAction } from "@/modules/users/actions/list-assignable-roles"
import { listInvitationsAction } from "@/modules/users/actions/list-invitations"
import { listMembersAction } from "@/modules/users/actions/list-members"
import { unwrapActionResult } from "@/shared/errors"

export const usersQueryKeys = {
  all: ["users"] as const,
  members: () => ["users", "members"] as const,
  invitations: () => ["users", "invitations"] as const,
  roles: () => ["users", "roles"] as const,
  inviteAccess: (token: string) => ["users", "invite-access", token] as const,
}

export const usersQueries = {
  members: () =>
    queryOptions({
      queryKey: usersQueryKeys.members(),
      queryFn: async () => unwrapActionResult(await listMembersAction()),
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
