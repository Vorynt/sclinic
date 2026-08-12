export type LegalDocumentSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type LegalDocumentContent = {
  title: string
  lastUpdated: string
  disclaimer: string
  sections: LegalDocumentSection[]
}
