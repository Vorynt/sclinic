import { z } from "zod"

export const calendarViewModeSchema = z.enum(["month", "week", "day"], {
  message: "Escolha mês, semana ou dia",
})

export const calendarSlotStepSchema = z.union(
  [z.literal(15), z.literal(30)],
  { message: "Escolha 15 ou 30 minutos" },
)

export const calendarWeekStartsOnSchema = z.union(
  [z.literal(0), z.literal(1)],
  { message: "Escolha domingo ou segunda" },
)

export const calendarCardPresetSchema = z.object({
  showProfessional: z.boolean(),
  showType: z.boolean(),
  showService: z.boolean(),
  showModality: z.boolean(),
  showReason: z.boolean(),
})

export const clinicCalendarSettingsSchema = z.object({
  defaultView: z.object({
    operations: calendarViewModeSchema,
    clinical: calendarViewModeSchema,
  }),
  slotStepMinutes: calendarSlotStepSchema,
  weekStartsOn: calendarWeekStartsOnSchema,
  showCanceled: z.boolean(),
  cardPresets: z.object({
    operations: calendarCardPresetSchema,
    clinical: calendarCardPresetSchema,
  }),
})

export type ClinicCalendarSettingsInput = z.input<
  typeof clinicCalendarSettingsSchema
>
export type ClinicCalendarSettings = z.output<
  typeof clinicCalendarSettingsSchema
>
export type CalendarCardPreset = z.output<typeof calendarCardPresetSchema>
export type CalendarSettingsPresetKey = "operations" | "clinical"
