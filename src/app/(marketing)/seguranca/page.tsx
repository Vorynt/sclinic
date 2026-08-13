import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { INFORMATION_SECURITY_POLICY } from "@/modules/marketing/constants/information-security-policy"

export const metadata: Metadata = {
  title: "Política de Segurança da Informação",
  description:
    "Política de Segurança da Informação do sclinic — controles e princípios de proteção.",
}

export default function SecurityPage() {
  return <LegalDocument document={INFORMATION_SECURITY_POLICY} />
}
