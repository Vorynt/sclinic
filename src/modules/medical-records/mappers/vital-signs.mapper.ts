import type { VitalSigns } from "@/modules/medical-records/types/vital-signs"

type VitalSignsRow = {
  id: string
  clinicId: string
  patientId: string
  appointmentId: string
  professionalId: string | null
  professionalName: string | null
  systolicMmHg: number | null
  diastolicMmHg: number | null
  heartRateBpm: number | null
  respiratoryRate: number | null
  temperatureC: number | null
  weightKg: number | null
  heightCm: number | null
  spo2Percent: number | null
  appointmentStartsAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export function toVitalSigns(row: VitalSignsRow): VitalSigns {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    appointmentId: row.appointmentId,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    systolicMmHg: row.systolicMmHg,
    diastolicMmHg: row.diastolicMmHg,
    heartRateBpm: row.heartRateBpm,
    respiratoryRate: row.respiratoryRate,
    temperatureC: row.temperatureC,
    weightKg: row.weightKg,
    heightCm: row.heightCm,
    spo2Percent: row.spo2Percent,
    appointmentStartsAt: row.appointmentStartsAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
