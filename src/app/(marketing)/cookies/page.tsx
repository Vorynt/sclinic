import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { COOKIE_POLICY } from "@/modules/marketing/constants/cookie-policy"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Política de Cookies do sclinic — cookies e tecnologias semelhantes.",
}

export default function CookiesPage() {
  return <LegalDocument document={COOKIE_POLICY} />
}
