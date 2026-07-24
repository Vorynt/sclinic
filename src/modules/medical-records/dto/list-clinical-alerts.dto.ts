import type { z } from "zod"

import type { listClinicalAlertsSchema } from "@/modules/medical-records/schemas/clinical-alert.schema"

export type ListClinicalAlertsDto = z.infer<typeof listClinicalAlertsSchema>
