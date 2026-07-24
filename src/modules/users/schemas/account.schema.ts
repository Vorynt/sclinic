import { z } from "zod"

function optionalPhone() {
  return z
    .string()
    .trim()
    .max(32, "Telefone inválido")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null))
    .refine((value) => value === null || value.length >= 8, {
      message: "Telefone inválido",
    })
}

export const updateAccountProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  phone: optionalPhone(),
})

export type UpdateAccountProfileInput = z.infer<
  typeof updateAccountProfileSchema
>
