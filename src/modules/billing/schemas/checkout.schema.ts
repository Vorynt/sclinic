import { z } from "zod"

export const createCheckoutSessionSchema = z.object({
  planId: z.string().uuid("Plano inválido."),
  successPath: z.string().min(1).optional(),
  cancelPath: z.string().min(1).optional(),
})

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>
