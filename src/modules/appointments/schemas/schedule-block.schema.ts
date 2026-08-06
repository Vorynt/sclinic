import { z } from "zod"

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

const MAX_BLOCK_DURATION_MS = 14 * 24 * 60 * 60 * 1000

export const scheduleBlockIdSchema = z.string().uuid("ID inválido")

export const listScheduleBlocksSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    professionalIds: z
      .array(z.string().uuid("Profissional inválido"))
      .max(100)
      .optional(),
  })
  .refine((data) => data.from < data.to, {
    message: "A data inicial deve ser anterior à data final.",
    path: ["to"],
  })

/**
 * `professionalId: null` = clinic-wide block.
 * `professionalId: uuid` = professional block.
 */
export const createScheduleBlockSchema = z
  .object({
    professionalId: z.string().uuid("Profissional inválido").nullable(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: optionalTrimmed,
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "O horário final deve ser depois do horário inicial.",
    path: ["endsAt"],
  })
  .refine(
    (data) =>
      data.endsAt.getTime() - data.startsAt.getTime() <= MAX_BLOCK_DURATION_MS,
    {
      message: "O bloqueio não pode exceder 14 dias.",
      path: ["endsAt"],
    },
  )

export const deleteScheduleBlockSchema = z.object({
  id: scheduleBlockIdSchema,
})
