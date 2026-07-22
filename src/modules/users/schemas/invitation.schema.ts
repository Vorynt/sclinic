import { z } from "zod"

import { ASSIGNABLE_ROLE_KEYS } from "@/modules/users/constants/users"

const assignableRoleKeySchema = z.enum(ASSIGNABLE_ROLE_KEYS)

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha deve ter no máximo 128 caracteres")

export const inviteMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .transform((value) => value.toLowerCase()),
  temporaryPassword: passwordSchema,
  roleKey: assignableRoleKeySchema,
})

export const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid("ID do convite inválido"),
})

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1, "Token é obrigatório"),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
