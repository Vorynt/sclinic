import type { PrescriptionPartySnapshot } from "@/db/schema"
import type { PrescriptionDocumentModel } from "@/modules/medical-records/prescription-template-designer"

export type PrescriptionStatus = "draft" | "issued"

export type Prescription = {
  id: string
  clinicId: string
  patientId: string
  appointmentId: string
  professionalId: string | null
  professionalName: string | null
  layoutId: string | null
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
  name: string
  version: number
  documentModel: PrescriptionDocumentModel
  html: string
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

/** Resolved letterhead for preview/issue. */
export type PrescriptionLayoutSource = {
  html: string
  version: number | null
  source: "system_default" | "clinic_custom"
  layout: PrescriptionLayout | null
}

/** Named template option for the create-prescription picker. */
export type PrescriptionTemplateOption = {
  id: string
  name: string
  isDefault: boolean
  html: string
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
  /** Active clinic templates (empty → system default via preview.layoutHtml). */
  templates: PrescriptionTemplateOption[]
  preview: PrescriptionPreviewContext
}
