import { compilePrescriptionTemplate } from "@/modules/medical-records/prescription-template-designer"
import {
  DEFAULT_PRESCRIPTION_ACCENT_COLOR,
  type PrescriptionBlock,
  type PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer/types/document-model"

const DEFAULT_BLOCK_IDS = {
  letterhead: "e1111111-1111-4111-8111-111111111111",
  title: "e2222222-2222-4222-8222-222222222222",
  patient: "e3333333-3333-4333-8333-333333333333",
  body: "e4444444-4444-4444-8444-444444444444",
  professional: "e5555555-5555-4555-8555-555555555555",
} as const

export function createDefaultExamRequestDocumentModel(): PrescriptionDocumentModel {
  const blocks: PrescriptionBlock[] = [
    {
      id: DEFAULT_BLOCK_IDS.letterhead,
      type: "letterhead",
      props: {
        align: "center",
        showDocument: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
      },
    },
    {
      id: DEFAULT_BLOCK_IDS.title,
      type: "title",
      props: { text: "Solicitação de exames", align: "center" },
    },
    {
      id: DEFAULT_BLOCK_IDS.patient,
      type: "patient",
      props: { align: "left", showDocument: true },
    },
    {
      id: DEFAULT_BLOCK_IDS.body,
      type: "body",
      props: { align: "left", minHeightMm: 80 },
    },
    {
      id: DEFAULT_BLOCK_IDS.professional,
      type: "professional",
      props: {
        align: "center",
        showCouncil: true,
        showSpecialty: true,
        showIssuedAt: true,
        showSignLine: true,
      },
    },
  ]

  return {
    version: 1,
    accentColor: DEFAULT_PRESCRIPTION_ACCENT_COLOR,
    blocks,
  }
}

export const DEFAULT_EXAM_REQUEST_DOCUMENT_MODEL =
  createDefaultExamRequestDocumentModel()

export const DEFAULT_EXAM_REQUEST_LAYOUT_HTML = compilePrescriptionTemplate(
  DEFAULT_EXAM_REQUEST_DOCUMENT_MODEL,
)
