import type {
  PrescriptionBlock,
  PrescriptionBlockType,
  PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer/types/document-model"

/** Stable IDs for the system default so tests/snapshots stay predictable. */
const DEFAULT_BLOCK_IDS = {
  letterhead: "a1111111-1111-4111-8111-111111111111",
  title: "a2222222-2222-4222-8222-222222222222",
  patient: "a3333333-3333-4333-8333-333333333333",
  body: "a4444444-4444-4444-8444-444444444444",
  professional: "a5555555-5555-4555-8555-555555555555",
} as const

export function createDefaultPrescriptionDocumentModel(): PrescriptionDocumentModel {
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
      props: { text: "Receita médica", align: "center" },
    },
    {
      id: DEFAULT_BLOCK_IDS.patient,
      type: "patient",
      props: { align: "left", showDocument: true },
    },
    {
      id: DEFAULT_BLOCK_IDS.body,
      type: "body",
      props: { align: "left", minHeightMm: 140 },
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

export const DEFAULT_PRESCRIPTION_DOCUMENT_MODEL =
  createDefaultPrescriptionDocumentModel()

export type BlockCatalogItem = {
  type: PrescriptionBlockType
  label: string
  description: string
  /** body is unique — palette hides when already present. */
  unique: boolean
}

export const PRESCRIPTION_BLOCK_CATALOG: BlockCatalogItem[] = [
  {
    type: "letterhead",
    label: "Timbrado",
    description: "Nome e dados da clínica",
    unique: false,
  },
  {
    type: "title",
    label: "Título",
    description: "Título do documento",
    unique: false,
  },
  {
    type: "patient",
    label: "Paciente",
    description: "Nome e documento do paciente",
    unique: false,
  },
  {
    type: "body",
    label: "Conteúdo",
    description: "Área da receita (obrigatório)",
    unique: true,
  },
  {
    type: "professional",
    label: "Profissional",
    description: "Assinatura e conselho",
    unique: false,
  },
  {
    type: "text",
    label: "Texto",
    description: "Texto estático",
    unique: false,
  },
  {
    type: "divider",
    label: "Divisor",
    description: "Linha horizontal",
    unique: false,
  },
  {
    type: "spacer",
    label: "Espaço",
    description: "Espaçamento vertical",
    unique: false,
  },
]

export function createBlockDefaults(
  type: PrescriptionBlockType,
  id: string,
): PrescriptionBlock {
  switch (type) {
    case "letterhead":
      return {
        id,
        type,
        props: {
          align: "center",
          showDocument: true,
          showAddress: true,
          showPhone: true,
          showEmail: true,
        },
      }
    case "title":
      return {
        id,
        type,
        props: { text: "Receita médica", align: "center" },
      }
    case "patient":
      return {
        id,
        type,
        props: { align: "left", showDocument: true },
      }
    case "body":
      return {
        id,
        type,
        props: { align: "left", minHeightMm: 140 },
      }
    case "professional":
      return {
        id,
        type,
        props: {
          align: "center",
          showCouncil: true,
          showSpecialty: true,
          showIssuedAt: true,
          showSignLine: true,
        },
      }
    case "text":
      return {
        id,
        type,
        props: { text: "Texto", align: "left" },
      }
    case "divider":
      return { id, type, props: { thicknessPx: 2 } }
    case "spacer":
      return { id, type, props: { heightMm: 8 } }
  }
}
