import { z } from "zod"

export const createRegularizeSessionSchema = z.object({
  planId: z.string().uuid("Plano inválido").optional(),
  successPath: z.string().min(1).optional(),
  cancelPath: z.string().min(1).optional(),
})

export type CreateRegularizeSessionInput = z.infer<
  typeof createRegularizeSessionSchema
>
