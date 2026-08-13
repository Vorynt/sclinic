import type { Metadata } from "next"

import { LegalDocument } from "@/modules/marketing/components/LegalDocument"
import { INCIDENT_RESPONSE_PROCEDURE } from "@/modules/marketing/constants/incident-response-procedure"

export const metadata: Metadata = {
  title: "Resposta a Incidentes",
  description:
    "Procedimento de Resposta a Incidentes de Segurança do sclinic.",
}

export default function IncidentsPage() {
  return <LegalDocument document={INCIDENT_RESPONSE_PROCEDURE} />
}
