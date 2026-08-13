import type { Metadata } from "next"

import { LegalDocumentsHub } from "@/modules/marketing/components/LegalDocumentsHub"

export const metadata: Metadata = {
  title: "Documentos legais",
  description:
    "Termos, políticas e documentos de governança do sclinic — software de gestão clínica.",
}

export default function LegalHubPage() {
  return <LegalDocumentsHub />
}
