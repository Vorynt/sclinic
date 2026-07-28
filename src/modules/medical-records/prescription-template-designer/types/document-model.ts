/**
 * Structured prescription letterhead — stacked blocks (no free positioning).
 * Compiles to HTML for preview/print; see ADR-008.
 */

export type BlockAlign = "left" | "center" | "right"

export type LetterheadBlockProps = {
  align: BlockAlign
  showDocument: boolean
  showAddress: boolean
  showPhone: boolean
  showEmail: boolean
}

export type TitleBlockProps = {
  text: string
  align: BlockAlign
}

export type PatientBlockProps = {
  align: BlockAlign
  showDocument: boolean
}

export type BodyBlockProps = {
  align: BlockAlign
  /** CSS-ish min height hint in mm (compiled to min-height). */
  minHeightMm: number
}

export type ProfessionalBlockProps = {
  align: BlockAlign
  showCouncil: boolean
  showSpecialty: boolean
  showIssuedAt: boolean
  showSignLine: boolean
}

export type TextBlockProps = {
  text: string
  align: BlockAlign
}

export type DividerBlockProps = {
  thicknessPx: number
}

export type SpacerBlockProps = {
  heightMm: number
}

export type PrescriptionBlock =
  | { id: string; type: "letterhead"; props: LetterheadBlockProps }
  | { id: string; type: "title"; props: TitleBlockProps }
  | { id: string; type: "patient"; props: PatientBlockProps }
  | { id: string; type: "body"; props: BodyBlockProps }
  | { id: string; type: "professional"; props: ProfessionalBlockProps }
  | { id: string; type: "text"; props: TextBlockProps }
  | { id: string; type: "divider"; props: DividerBlockProps }
  | { id: string; type: "spacer"; props: SpacerBlockProps }

export type PrescriptionBlockType = PrescriptionBlock["type"]

export type PrescriptionDocumentModel = {
  version: 1
  blocks: PrescriptionBlock[]
}

export const MAX_PRESCRIPTION_TEMPLATE_BLOCKS = 20
export const MAX_PRESCRIPTION_TEMPLATES_PER_CLINIC = 3
