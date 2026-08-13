import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Template ROPA — governança interna.
 * Não substitui Política de Privacidade ou DPA.
 */
export const ROPA_TEMPLATE: LegalDocumentContent = {
  title: "ROPA — Registro das Operações de Tratamento",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Template interno de governança, publicado para transparência. Deve ser preenchido por processo/fluxo de tratamento. Não substitui a Política de Privacidade ou o DPA. Revisão jurídica obrigatória antes de uso operacional.",
  sections: [
    {
      id: "instrucoes",
      title: "1. Instruções",
      paragraphs: [
        "Mantenha um registro por operação relevante. O ROPA deve refletir a arquitetura real, fornecedores, localização, finalidade, categorias de dados, base legal e retenção.",
      ],
      table: {
        headers: ["Campo", "Preenchimento"],
        rows: [
          [
            "Processo/atividade",
            "[Ex.: Gestão de pacientes; Agenda e recepção; Prontuário/atendimento; Cobrança clínica manual; Assinatura SaaS]",
          ],
          ["Controlador", "[Clínica / Prestadora]"],
          ["Operador", "[Prestadora / terceiro]"],
          ["Finalidade", "[Finalidade específica]"],
          ["Base legal", "[Art. 7º ou 11 da LGPD, conforme aplicável]"],
          ["Titulares", "[Pacientes / profissionais / usuários]"],
          ["Dados comuns", "[Categorias]"],
          ["Dados sensíveis", "[Categorias]"],
          ["Suboperadores", "[Lista]"],
          ["Origem", "[Titular / clínica / usuário / integração]"],
          ["Destinatários", "[Quem recebe]"],
          ["Transferência internacional", "[Sim/Não + mecanismo]"],
          ["Retenção", "[Critério]"],
          ["Medidas de segurança", "[Controles]"],
          ["Risco", "[Baixo/Médio/Alto]"],
          ["Última revisão", "[DD/MM/AAAA]"],
        ],
      },
    },
    {
      id: "controles-minimos",
      title: "2. Controles mínimos",
      paragraphs: [],
      bullets: [
        "Cada processo deve possuir finalidade específica.",
        "Dados sensíveis devem ser explicitamente identificados.",
        "A base legal deve estar vinculada ao controlador.",
        "Suboperadores e transferências internacionais devem ser verificáveis.",
        "Retenção deve possuir critério objetivo.",
        "Riscos e medidas de segurança devem ser proporcionais ao tratamento.",
      ],
    },
  ],
}
