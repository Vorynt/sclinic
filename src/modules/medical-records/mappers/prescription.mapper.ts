import type { PrescriptionPartySnapshot } from "@/db/schema"
import type { ClinicalDocumentKind } from "@/modules/medical-records/constants/clinical-documents"
import type { PrescriptionDocumentModel } from "@/modules/medical-records/prescription-template-designer"
import { prescriptionDocumentModelSchema } from "@/modules/medical-records/prescription-template-designer"
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
  kind: ClinicalDocumentKind
  metadata: Record<string, unknown> | null
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

type PrescriptionLayoutRow = {
  id: string
  clinicId: string
  name: string
  version: number
  documentModel: unknown
  html: string
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

function toDocumentModel(raw: unknown): PrescriptionDocumentModel {
  return prescriptionDocumentModelSchema.parse(raw)
}

export function toPrescription(row: PrescriptionRow): Prescription {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    appointmentId: row.appointmentId,
    professionalId: row.professionalId,
    professionalName: row.professionalName,
    kind: row.kind,
    metadata: row.metadata,
    layoutId: row.layoutId,
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
    name: row.name,
    version: row.version,
    documentModel: toDocumentModel(row.documentModel),
    html: row.html,
    isActive: row.isActive,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
