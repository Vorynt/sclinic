import type { z } from "zod"

import type { upsertVitalSignsSchema } from "@/modules/medical-records/schemas/vital-signs.schema"

export type UpsertVitalSignsDto = z.infer<typeof upsertVitalSignsSchema>
