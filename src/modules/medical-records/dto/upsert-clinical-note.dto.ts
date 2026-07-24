import type { z } from "zod"

import type { upsertClinicalNoteSchema } from "@/modules/medical-records/schemas/clinical-note.schema"

export type UpsertClinicalNoteDto = z.infer<typeof upsertClinicalNoteSchema>
