import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { TERMS_OF_USE } from "@/modules/marketing/constants/terms-of-use"

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do sclinic — software de gestão para clínicas e consultórios.",
}

export default function TermsPage() {
  return <LegalDocument document={TERMS_OF_USE} />
}
