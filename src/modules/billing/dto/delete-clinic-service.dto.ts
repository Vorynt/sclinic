import type { clinicServiceIdSchema } from "@/modules/billing/schemas/clinic-service.schema"
import type { z } from "zod"

export type DeleteClinicServiceDto = z.infer<typeof clinicServiceIdSchema>
