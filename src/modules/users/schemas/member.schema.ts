import { z } from "zod"

import { ASSIGNABLE_ROLE_KEYS } from "@/modules/users/constants/users"

const assignableRoleKeySchema = z.enum(ASSIGNABLE_ROLE_KEYS)

export const updateMemberRoleSchema = z.object({
  membershipId: z.string().uuid("ID do membro inválido"),
  roleKey: assignableRoleKeySchema,
})

export const removeMemberSchema = z.object({
  membershipId: z.string().uuid("ID do membro inválido"),
})

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>
