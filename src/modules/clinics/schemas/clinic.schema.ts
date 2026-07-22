import { z } from "zod"

function optionalString(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
}

export const createClinicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da clínica é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  tradeName: optionalString(200, "Nome fantasia deve ter no máximo 200 caracteres"),
  document: optionalString(18, "CNPJ/CPF inválido"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.string().email("E-mail inválido").optional()),
  phone: optionalString(32, "Telefone inválido"),
  addressStreet: optionalString(200, "Rua inválida"),
  addressNumber: optionalString(32, "Número inválido"),
  addressComplement: optionalString(120, "Complemento inválido"),
  addressNeighborhood: optionalString(120, "Bairro inválido"),
  addressCity: optionalString(120, "Cidade inválida"),
  addressState: z
    .string()
    .trim()
    .max(2, "UF inválida")
    .optional()
    .transform((value) => {
      if (!value || value.length === 0) return undefined
      return value.toUpperCase()
    }),
  addressZip: optionalString(16, "CEP inválido"),
  planId: z.string().uuid("Plano inválido"),
})

export type CreateClinicInput = z.infer<typeof createClinicSchema>
