import { z } from "zod"

import { ASSIGNABLE_ROLE_KEYS } from "@/modules/users/constants/users"
import { listQuerySchema } from "@/shared/validators"

const assignableRoleKeySchema = z.enum(ASSIGNABLE_ROLE_KEYS)

export const listMembersSchema = listQuerySchema

export const updateMemberRoleSchema = z.object({
  membershipId: z.string().uuid("Membro inválido"),
  roleKey: assignableRoleKeySchema,
})

export const removeMemberSchema = z.object({
  membershipId: z.string().uuid("Membro inválido"),
})

export const updateMemberStatusSchema = z.object({
  membershipId: z.string().uuid("Membro inválido"),
  status: z.enum(["active", "suspended"]),
})

export type ListMembersInput = z.infer<typeof listMembersSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>
export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>
