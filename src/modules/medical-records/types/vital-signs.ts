export type VitalSigns = {
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

export type VitalSignsForAppointment = {
  vitals: VitalSigns | null
  appointmentId: string
  patientId: string
  editable: boolean
}
