import type { z } from "zod"

import type { deleteClinicalAlertSchema } from "@/modules/medical-records/schemas/clinical-alert.schema"

export type DeleteClinicalAlertDto = z.infer<typeof deleteClinicalAlertSchema>
