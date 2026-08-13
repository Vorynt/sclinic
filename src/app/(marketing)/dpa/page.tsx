import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { DATA_PROCESSING_AGREEMENT } from "@/modules/marketing/constants/data-processing-agreement"

export const metadata: Metadata = {
  title: "DPA — Acordo de Tratamento de Dados",
  description:
    "DPA do sclinic — acordo de tratamento de dados entre clínica controladora e Prestadora.",
}

export default function DpaPage() {
  return <LegalDocument document={DATA_PROCESSING_AGREEMENT} />
}
