import type { PrescriptionPartySnapshot } from "@/db/schema"

export type PrescriptionStatus = "draft" | "issued"

export type Prescription = {
  id: string
  clinicId: string
  patientId: string
  appointmentId: string
  professionalId: string | null
  professionalName: string | null
  status: PrescriptionStatus
  body: string
  plainText: string
  layoutHtml: string | null
  layoutVersion: number | null
  clinicSnapshot: PrescriptionPartySnapshot | null
  patientSnapshot: PrescriptionPartySnapshot | null
  professionalSnapshot: PrescriptionPartySnapshot | null
  issuedAt: Date | null
  appointmentStartsAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PrescriptionLayout = {
  id: string
  clinicId: string
  version: number
  html: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/** Active layout for the clinic, or system default when none is configured. */
export type PrescriptionLayoutSource = {
  html: string
  version: number | null
  source: "system_default" | "clinic_custom"
  layout: PrescriptionLayout | null
}

/** Live preview context for draft composition (not frozen). */
export type PrescriptionPreviewContext = {
  layoutHtml: string
  clinic: PrescriptionPartySnapshot
  patient: PrescriptionPartySnapshot
  professional: PrescriptionPartySnapshot | null
}

export type PrescriptionsForAppointment = {
  items: Prescription[]
  appointmentId: string
  patientId: string
  editable: boolean
  preview: PrescriptionPreviewContext
}
