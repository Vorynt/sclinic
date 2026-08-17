import type { Metadata } from "next";

import { LegalDocument } from "@/modules/marketing/components/LegalDocument";
import { SAAS_AGREEMENT } from "@/modules/marketing/constants/saas-agreement";

export const metadata: Metadata = {
  title: "Contrato SaaS",
  description:
    "Contrato SaaS do sclinic — prestação de software de gestão clínica em nuvem.",
};

export default function SaasAgreementPage() {
  return <LegalDocument document={SAAS_AGREEMENT} />;
}
