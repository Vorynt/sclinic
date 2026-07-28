import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido")
  .transform((value) => value.toLowerCase())

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha deve ter no máximo 128 caracteres")

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  email: emailSchema,
  password: passwordSchema,
  phone: z
    .string()
    .trim()
    .min(8, "Telefone inválido")
    .max(32, "Telefone inválido")
    .optional(),
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
})

export const switchClinicSchema = z.object({
  clinicId: z.string().uuid("Clínica inválida"),
})

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url("Endereço de retorno inválido").optional(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Link de redefinição inválido"),
  newPassword: passwordSchema,
})

/** Client form schema — includes confirm; action uses `resetPasswordSchema`. */
export const resetPasswordFormSchema = z
  .object({
    token: z.string().min(1, "Link de redefinição inválido"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type SwitchClinicInput = z.infer<typeof switchClinicSchema>
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
