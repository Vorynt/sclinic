import { z } from "zod"

import {
  CLINICAL_ALERT_KINDS,
  CLINICAL_ALERT_SEVERITIES,
} from "@/modules/medical-records/constants/clinical-alerts"

const optionalNotes = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()

export const patientIdSchema = z.string().uuid("Paciente inválido")
export const clinicalAlertIdSchema = z.string().uuid("ID inválido")

export const listClinicalAlertsSchema = z.object({
  patientId: patientIdSchema,
})

export const createClinicalAlertSchema = z.object({
  patientId: patientIdSchema,
  kind: z.enum(CLINICAL_ALERT_KINDS),
  label: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória")
    .max(120, "Descrição muito longa"),
  severity: z.enum(CLINICAL_ALERT_SEVERITIES).default("medium"),
  notes: optionalNotes,
})

export const deleteClinicalAlertSchema = z.object({
  id: clinicalAlertIdSchema,
})
