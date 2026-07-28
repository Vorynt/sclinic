import type { PrescriptionPartySnapshot } from "@/db/schema"
import type {
  Prescription,
  PrescriptionLayout,
  PrescriptionStatus,
} from "@/modules/medical-records/types/prescription"

type PrescriptionRow = {
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

type PrescriptionLayoutRow = {
  id: string
  clinicId: string
  version: number
  html: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function toPrescription(row: PrescriptionRow): Prescription {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    appointmentId: row.appointmentId,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    status: row.status,
    body: row.body,
    plainText: row.plainText,
    layoutHtml: row.layoutHtml,
    layoutVersion: row.layoutVersion,
    clinicSnapshot: row.clinicSnapshot,
    patientSnapshot: row.patientSnapshot,
    professionalSnapshot: row.professionalSnapshot,
    issuedAt: row.issuedAt,
    appointmentStartsAt: row.appointmentStartsAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toPrescriptionLayout(
  row: PrescriptionLayoutRow,
): PrescriptionLayout {
  return {
    id: row.id,
    clinicId: row.clinicId,
    version: row.version,
    html: row.html,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
