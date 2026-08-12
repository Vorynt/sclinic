import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { DATA_RETENTION_POLICY } from "@/modules/marketing/constants/data-retention-policy"

export const metadata: Metadata = {
  title: "Política de Retenção e Exclusão",
  description:
    "Política de Retenção e Exclusão de Dados do sclinic — critérios de guarda e descarte.",
}

export default function RetentionPage() {
  return <LegalDocument document={DATA_RETENTION_POLICY} />
}
