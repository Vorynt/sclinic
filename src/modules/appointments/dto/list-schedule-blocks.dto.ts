import type { z } from "zod"

import type { listScheduleBlocksSchema } from "@/modules/appointments/schemas/schedule-block.schema"

export type ListScheduleBlocksDto = z.infer<typeof listScheduleBlocksSchema>
