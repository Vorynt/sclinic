export type LegalDocumentTable = {
  headers: string[]
  rows: string[][]
}

export type LegalDocumentSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  table?: LegalDocumentTable
}

export type LegalDocumentCategory =
  | "service"
  | "contractual"
  | "governance"

export type LegalDocumentContent = {
  title: string
  lastUpdated: string
  disclaimer: string
  sections: LegalDocumentSection[]
}

export type LegalDocumentMeta = {
  id: string
  href: string
  title: string
  description: string
  category: LegalDocumentCategory
  document: LegalDocumentContent
}
