import { queryOptions } from "@tanstack/react-query"

import { listAssignableRolesAction } from "@/modules/users/actions/list-assignable-roles"
import { listInvitationsAction } from "@/modules/users/actions/list-invitations"
import { listMembersAction } from "@/modules/users/actions/list-members"
import { unwrapActionResult } from "@/shared/errors"

export const usersQueryKeys = {
  all: ["users"] as const,
  members: () => ["users", "members"] as const,
  invitations: () => ["users", "invitations"] as const,
  roles: () => ["users", "roles"] as const,
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
}
