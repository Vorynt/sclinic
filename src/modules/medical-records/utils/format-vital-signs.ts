import type { VitalSigns } from "@/modules/medical-records/types/vital-signs"

export type VitalSignsSummaryRow = {
  label: string
  value: string
}

export function formatVitalSignsSummary(
  vitals: VitalSigns,
): VitalSignsSummaryRow[] {
  const rows: VitalSignsSummaryRow[] = []

  if (vitals.systolicMmHg != null && vitals.diastolicMmHg != null) {
    rows.push({
      label: "Pressão arterial",
      value: `${vitals.systolicMmHg}/${vitals.diastolicMmHg} mmHg`,
    })
  }
  if (vitals.heartRateBpm != null) {
    rows.push({
      label: "Frequência cardíaca",
      value: `${vitals.heartRateBpm} bpm`,
    })
  }
  if (vitals.respiratoryRate != null) {
    rows.push({
      label: "Frequência respiratória",
      value: `${vitals.respiratoryRate} rpm`,
    })
  }
  if (vitals.temperatureC != null) {
    rows.push({
      label: "Temperatura",
      value: `${vitals.temperatureC} °C`,
    })
  }
  if (vitals.weightKg != null) {
    rows.push({
      label: "Peso",
      value: `${vitals.weightKg} kg`,
    })
  }
  if (vitals.heightCm != null) {
    rows.push({
      label: "Altura",
      value: `${vitals.heightCm} cm`,
    })
  }
  if (vitals.spo2Percent != null) {
    rows.push({
      label: "SpO₂",
      value: `${vitals.spo2Percent} %`,
    })
  }

  return rows
}
