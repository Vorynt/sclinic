import type { clinicServiceIdSchema } from "@/modules/billing/schemas/clinic-service.schema"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import type { z } from "zod"

export type GetClinicServiceDto = z.infer<typeof clinicServiceIdSchema>

export type GetClinicServiceResult = ClinicService
