import { z } from "zod"

const TIME_HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/

const timeSchema = z
  .string()
  .trim()
  .regex(TIME_HH_MM, "Horário inválido (use HH:mm)")

const intervalSchema = z
  .object({
    opensAt: timeSchema,
    closesAt: timeSchema,
  })
  .refine((interval) => interval.opensAt < interval.closesAt, {
    message: "Horário de abertura deve ser anterior ao de fechamento",
    path: ["closesAt"],
  })

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

const dayHoursSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .min(0, "Dia da semana inválido")
      .max(6, "Dia da semana inválido"),
    isClosed: z.boolean(),
    intervals: z.array(intervalSchema).max(2, "Máximo de 2 intervalos por dia"),
  })
  .superRefine((day, ctx) => {
    if (day.isClosed) {
      if (day.intervals.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "Dia fechado não deve ter intervalos",
          path: ["intervals"],
        })
      }
      return
    }

    if (day.intervals.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Informe ao menos um intervalo ou marque o dia como fechado",
        path: ["intervals"],
      })
      return
    }

    if (day.intervals.length === 2) {
      const [first, second] = day.intervals
      if (!first || !second) return

      if (timeToMinutes(second.opensAt) <= timeToMinutes(first.closesAt)) {
        ctx.addIssue({
          code: "custom",
          message: "O segundo intervalo deve começar após o fim do primeiro",
          path: ["intervals", 1, "opensAt"],
        })
      }
    }
  })

export const upsertProfessionalHoursSchema = z.object({
  professionalId: z.string().uuid("Profissional inválido"),
  days: z
    .array(dayHoursSchema)
    .length(7, "Informe os 7 dias da semana")
    .superRefine((days, ctx) => {
      const seen = new Set<number>()
      for (const [index, day] of days.entries()) {
        if (seen.has(day.dayOfWeek)) {
          ctx.addIssue({
            code: "custom",
            message: "Dia da semana duplicado",
            path: [index, "dayOfWeek"],
          })
        }
        seen.add(day.dayOfWeek)
      }

      for (let dow = 0; dow <= 6; dow += 1) {
        if (!seen.has(dow)) {
          ctx.addIssue({
            code: "custom",
            message: `Falta o dia da semana ${dow}`,
            path: ["days"],
          })
        }
      }
    }),
})

export const getProfessionalHoursSchema = z.object({
  professionalId: z.string().uuid("Profissional inválido"),
})

export type UpsertProfessionalHoursInput = z.infer<
  typeof upsertProfessionalHoursSchema
>
export type GetProfessionalHoursInput = z.infer<
  typeof getProfessionalHoursSchema
>
