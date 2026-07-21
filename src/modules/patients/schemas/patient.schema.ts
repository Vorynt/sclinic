import { z } from "zod"

import { isValidCpf, stripCpf } from "@/utils/cpf"

const cpfSchema = z
  .string()
  .trim()
  .min(1, "CPF é obrigatório")
  .transform(stripCpf)
  .refine(isValidCpf, { message: "CPF inválido" })

export const patientIdSchema = z.string().trim().min(1, "ID inválido")

export const createPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  cpf: cpfSchema,
})

export const updatePatientSchema = z
  .object({
    id: patientIdSchema,
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres")
      .optional(),
    cpf: cpfSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.cpf !== undefined, {
    message: "Informe ao menos um campo para atualizar",
    path: ["_form"],
  })

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
