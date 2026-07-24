import type {
  ClinicalAlertKind,
  ClinicalAlertSeverity,
} from "@/modules/medical-records/types/clinical-alert"

export const CLINICAL_ALERT_KIND_LABELS: Record<ClinicalAlertKind, string> = {
  allergy: "Alergia",
  restriction: "Restrição",
  attention: "Atenção",
  other: "Outro",
}

export const CLINICAL_ALERT_SEVERITY_LABELS: Record<
  ClinicalAlertSeverity,
  string
> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
}

export const CLINICAL_ALERT_KINDS = [
  "allergy",
  "restriction",
  "attention",
  "other",
] as const satisfies readonly ClinicalAlertKind[]

export const CLINICAL_ALERT_SEVERITIES = [
  "low",
  "medium",
  "high",
] as const satisfies readonly ClinicalAlertSeverity[]
