import { routes } from "@/config/routes"
import { COOKIE_POLICY } from "@/modules/marketing/constants/cookie-policy"
import { DATA_PROCESSING_AGREEMENT } from "@/modules/marketing/constants/data-processing-agreement"
import { DATA_RETENTION_POLICY } from "@/modules/marketing/constants/data-retention-policy"
import { INCIDENT_RESPONSE_PROCEDURE } from "@/modules/marketing/constants/incident-response-procedure"
import { INFORMATION_SECURITY_POLICY } from "@/modules/marketing/constants/information-security-policy"
import { PRIVACY_POLICY } from "@/modules/marketing/constants/privacy-policy"
import { ROPA_TEMPLATE } from "@/modules/marketing/constants/ropa-template"
import { SAAS_AGREEMENT } from "@/modules/marketing/constants/saas-agreement"
import { TERMS_OF_USE } from "@/modules/marketing/constants/terms-of-use"
import type {
  LegalDocumentCategory,
  LegalDocumentMeta,
} from "@/modules/marketing/types/legal-document"

export const LEGAL_DOCUMENT_CATEGORY_LABELS: Record<
  LegalDocumentCategory,
  string
> = {
  service: "Serviço",
  contractual: "Contratual",
  governance: "Governança",
}

export const LEGAL_DOCUMENTS: LegalDocumentMeta[] = [
  {
    id: "privacy",
    href: routes.privacy,
    title: PRIVACY_POLICY.title,
    description:
      "Como o sclinic trata dados pessoais e atua como controlador ou operador.",
    category: "service",
    document: PRIVACY_POLICY,
  },
  {
    id: "cookies",
    href: routes.cookies,
    title: COOKIE_POLICY.title,
    description:
      "Cookies e tecnologias semelhantes usados para sessão, segurança e performance.",
    category: "service",
    document: COOKIE_POLICY,
  },
  {
    id: "terms",
    href: routes.terms,
    title: TERMS_OF_USE.title,
    description:
      "Regras gerais de utilização do Serviço por clínicas, profissionais e equipes.",
    category: "service",
    document: TERMS_OF_USE,
  },
  {
    id: "saas",
    href: routes.saasAgreement,
    title: SAAS_AGREEMENT.title,
    description:
      "Modelo de contrato de prestação do software em nuvem (SaaS).",
    category: "contractual",
    document: SAAS_AGREEMENT,
  },
  {
    id: "dpa",
    href: routes.dpa,
    title: DATA_PROCESSING_AGREEMENT.title,
    description:
      "Anexo de tratamento de dados entre clínica controladora e Prestadora operadora.",
    category: "contractual",
    document: DATA_PROCESSING_AGREEMENT,
  },
  {
    id: "security",
    href: routes.security,
    title: INFORMATION_SECURITY_POLICY.title,
    description:
      "Princípios e controles mínimos de segurança da informação do sclinic.",
    category: "governance",
    document: INFORMATION_SECURITY_POLICY,
  },
  {
    id: "retention",
    href: routes.retention,
    title: DATA_RETENTION_POLICY.title,
    description:
      "Critérios de retenção, exclusão, backups e preservação de dados.",
    category: "governance",
    document: DATA_RETENTION_POLICY,
  },
  {
    id: "incidents",
    href: routes.incidents,
    title: INCIDENT_RESPONSE_PROCEDURE.title,
    description:
      "Fluxo de detecção, contenção, comunicação e registro de incidentes.",
    category: "governance",
    document: INCIDENT_RESPONSE_PROCEDURE,
  },
  {
    id: "ropa",
    href: routes.ropa,
    title: ROPA_TEMPLATE.title,
    description:
      "Template de registro das operações de tratamento (governança LGPD).",
    category: "governance",
    document: ROPA_TEMPLATE,
  },
]

export const LEGAL_DOCUMENT_CATEGORIES: LegalDocumentCategory[] = [
  "service",
  "contractual",
  "governance",
]
