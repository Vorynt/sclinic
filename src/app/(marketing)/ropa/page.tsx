import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { ROPA_TEMPLATE } from "@/modules/marketing/constants/ropa-template"

export const metadata: Metadata = {
  title: "ROPA — Registro de Operações",
  description:
    "Template ROPA do sclinic — registro das operações de tratamento de dados.",
}

export default function RopaPage() {
  return <LegalDocument document={ROPA_TEMPLATE} />
}
