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
  roleKey: assignableRoleKeySchema,
})

export const revokeInvitationSchema = z.object({
  invitationId: z.string().uuid("Convite inválido"),
})

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1, "Link do convite inválido"),
})

export const inviteAccessTokenSchema = z.object({
  token: z.string().trim().min(1, "Link do convite inválido"),
})

export const setPasswordFromInviteSchema = z
  .object({
    token: z.string().trim().min(1, "Link do convite inválido"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
export type InviteAccessTokenInput = z.infer<typeof inviteAccessTokenSchema>
export type SetPasswordFromInviteInput = z.infer<
  typeof setPasswordFromInviteSchema
>
