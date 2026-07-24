import { z } from "zod"

import { listQuerySchema } from "@/shared/validators"

export const listAuditLogsSchema = listQuerySchema.extend({
  status: z.enum(["success", "error"]).optional(),
  entityType: z.string().trim().min(1).optional(),
})

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>
