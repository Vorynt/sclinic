import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { PRIVACY_POLICY } from "@/modules/marketing/constants/privacy-policy"

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do sclinic — tratamento de dados pessoais e LGPD.",
}

export default function PrivacyPage() {
  return <LegalDocument document={PRIVACY_POLICY} />
}
