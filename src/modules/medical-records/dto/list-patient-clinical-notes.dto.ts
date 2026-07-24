import type { z } from "zod"

import type { listPatientClinicalNotesSchema } from "@/modules/medical-records/schemas/clinical-note.schema"

export type ListPatientClinicalNotesDto = z.infer<
  typeof listPatientClinicalNotesSchema
>
