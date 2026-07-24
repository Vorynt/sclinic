"use client"

import { Badge } from "@/components/ui/badge"
import {
  CLINICAL_ALERT_KIND_LABELS,
} from "@/modules/medical-records/constants/clinical-alerts"
import { useClinicalAlertsQuery } from "@/modules/medical-records/hooks/use-clinical-alerts"
import type {
  ClinicalAlert,
  ClinicalAlertSeverity,
} from "@/modules/medical-records/types/clinical-alert"

type PatientClinicalAlertBadgesProps = {
  patientId: string
}

function severityVariant(
  severity: ClinicalAlertSeverity,
): "destructive" | "secondary" | "outline" {
  if (severity === "high") return "destructive"
  if (severity === "medium") return "secondary"
  return "outline"
}

export function PatientClinicalAlertBadges({
  patientId,
}: PatientClinicalAlertBadgesProps) {
  const alertsQuery = useClinicalAlertsQuery(patientId)

  if (alertsQuery.isLoading || alertsQuery.isError || !alertsQuery.data) {
    return null
  }

  if (alertsQuery.data.length === 0) {
    return null
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Alertas clínicos"
    >
      {alertsQuery.data.map((alert) => (
        <ClinicalAlertBadge key={alert.id} alert={alert} />
      ))}
    </div>
  )
}

function ClinicalAlertBadge({ alert }: { alert: ClinicalAlert }) {
  return (
    <Badge variant={severityVariant(alert.severity)} title={alert.notes ?? undefined}>
      {CLINICAL_ALERT_KIND_LABELS[alert.kind]}: {alert.label}
    </Badge>
  )
}
