import type { z } from "zod"

import type { createScheduleBlockSchema } from "@/modules/appointments/schemas/schedule-block.schema"

export type CreateScheduleBlockDto = z.infer<typeof createScheduleBlockSchema>
