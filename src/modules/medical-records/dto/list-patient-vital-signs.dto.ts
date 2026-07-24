import type { z } from "zod"

import type { listPatientVitalSignsSchema } from "@/modules/medical-records/schemas/vital-signs.schema"

export type ListPatientVitalSignsDto = z.infer<
  typeof listPatientVitalSignsSchema
>
