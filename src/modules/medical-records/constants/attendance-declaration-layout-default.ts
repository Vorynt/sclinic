import { compilePrescriptionTemplate } from "@/modules/medical-records/prescription-template-designer"
import type {
  PrescriptionBlock,
  PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer/types/document-model"

/** Stable IDs for the attendance declaration system default. */
const DEFAULT_BLOCK_IDS = {
  letterhead: "b1111111-1111-4111-8111-111111111111",
  title: "b2222222-2222-4222-8222-222222222222",
  patient: "b3333333-3333-4333-8333-333333333333",
  body: "b4444444-4444-4444-8444-444444444444",
  professional: "b5555555-5555-4555-8555-555555555555",
} as const

export function createDefaultAttendanceDeclarationDocumentModel(): PrescriptionDocumentModel {
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
      props: { text: "Declaração de comparecimento", align: "center" },
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

  return { version: 1, blocks }
}

export const DEFAULT_ATTENDANCE_DECLARATION_DOCUMENT_MODEL =
  createDefaultAttendanceDeclarationDocumentModel()

export const DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML =
  compilePrescriptionTemplate(DEFAULT_ATTENDANCE_DECLARATION_DOCUMENT_MODEL)
