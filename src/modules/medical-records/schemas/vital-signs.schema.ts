import { z } from "zod"

export const appointmentIdSchema = z.string().uuid("ID inválido")

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined
  return value
}

const optionalInt = (min: number, max: number, message: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: message })
      .int(message)
      .min(min, message)
      .max(max, message)
      .optional(),
  )

const optionalFloat = (min: number, max: number, message: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: message })
      .min(min, message)
      .max(max, message)
      .optional(),
  )

export const upsertVitalSignsSchema = z
  .object({
    appointmentId: appointmentIdSchema,
    systolicMmHg: optionalInt(50, 300, "Pressão sistólica inválida"),
    diastolicMmHg: optionalInt(20, 200, "Pressão diastólica inválida"),
    heartRateBpm: optionalInt(20, 300, "Frequência cardíaca inválida"),
    respiratoryRate: optionalInt(5, 80, "Frequência respiratória inválida"),
    temperatureC: optionalFloat(30, 45, "Temperatura inválida"),
    weightKg: optionalFloat(1, 500, "Peso inválido"),
    heightCm: optionalFloat(30, 280, "Altura inválida"),
    spo2Percent: optionalInt(50, 100, "SpO₂ inválida"),
  })
  .superRefine((data, ctx) => {
    const hasAny =
      data.systolicMmHg != null ||
      data.diastolicMmHg != null ||
      data.heartRateBpm != null ||
      data.respiratoryRate != null ||
      data.temperatureC != null ||
      data.weightKg != null ||
      data.heightCm != null ||
      data.spo2Percent != null

    if (!hasAny) {
      ctx.addIssue({
        code: "custom",
        message: "Informe ao menos um sinal vital.",
        path: ["systolicMmHg"],
      })
    }

    const hasSystolic = data.systolicMmHg != null
    const hasDiastolic = data.diastolicMmHg != null
    if (hasSystolic !== hasDiastolic) {
      ctx.addIssue({
        code: "custom",
        message: "Informe pressão sistólica e diastólica juntas.",
        path: hasSystolic ? ["diastolicMmHg"] : ["systolicMmHg"],
      })
    }
  })

export const listPatientVitalSignsSchema = z.object({
  patientId: z.string().uuid("Paciente inválido"),
  excludeAppointmentId: appointmentIdSchema.optional(),
})
