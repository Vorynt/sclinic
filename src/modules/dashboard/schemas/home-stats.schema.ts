import { z } from "zod"

export const receptionDayBoardSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((data) => data.from < data.to, {
    message: "A data inicial deve ser anterior à data final.",
    path: ["to"],
  })

export type ReceptionDayBoardInput = z.infer<typeof receptionDayBoardSchema>
