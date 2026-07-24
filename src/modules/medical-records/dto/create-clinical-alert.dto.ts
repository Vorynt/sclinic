import type { z } from "zod"

import type { createClinicalAlertSchema } from "@/modules/medical-records/schemas/clinical-alert.schema"

export type CreateClinicalAlertDto = z.infer<typeof createClinicalAlertSchema>
