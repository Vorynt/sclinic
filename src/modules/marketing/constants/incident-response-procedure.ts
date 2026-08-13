import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Procedimento interno de resposta a incidentes — publicado para transparência.
 * Não substitui avaliação jurídica do incidente concreto.
 */
export const INCIDENT_RESPONSE_PROCEDURE: LegalDocumentContent = {
  title: "Procedimento de Resposta a Incidentes de Segurança",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Documento interno de governança, publicado para transparência. A finalidade é estruturar resposta, evidência e comunicação. Não substitui avaliação jurídica do incidente concreto. Revisão jurídica obrigatória antes de considerar o texto vinculante.",
  sections: [
    {
      id: "objetivo",
      title: "1. Objetivo",
      paragraphs: [
        "Estabelecer fluxo para identificar, conter, investigar, remediar e comunicar incidentes de segurança que possam afetar dados pessoais ou a disponibilidade e integridade do sclinic.",
      ],
    },
    {
      id: "exemplos-incidentes",
      title: "2. Exemplos de incidentes",
      paragraphs: [],
      bullets: [
        "Acesso indevido a tenant ou prontuário.",
        "Exposição de credencial ou segredo.",
        "Falha de autorização permitindo acesso cruzado entre clínicas.",
        "Exfiltração ou compartilhamento não autorizado.",
        "Ransomware ou código malicioso.",
        "Perda ou alteração indevida de dados.",
        "Indisponibilidade decorrente de ataque.",
        "Envio de informação para destinatário incorreto.",
      ],
    },
    {
      id: "niveis-severidade",
      title: "3. Níveis de severidade",
      paragraphs: [],
      table: {
        headers: ["Nível", "Critério indicativo", "Resposta"],
        rows: [
          [
            "Crítico",
            "Potencial exposição de dados de saúde, múltiplos tenants, grande volume ou impacto severo",
            "Acionamento imediato, contenção prioritária e avaliação executiva/jurídica",
          ],
          [
            "Alto",
            "Exposição confirmada ou provável de dados pessoais relevantes",
            "Contenção rápida, investigação e avaliação de comunicação",
          ],
          [
            "Médio",
            "Evento limitado, sem evidência de exposição relevante",
            "Investigação e correção em prazo proporcional",
          ],
          [
            "Baixo",
            "Evento técnico sem impacto relevante em dados pessoais",
            "Tratamento pelo fluxo operacional",
          ],
        ],
      },
    },
    {
      id: "fluxo-resposta",
      title: "4. Fluxo de resposta",
      paragraphs: [],
      bullets: [
        "Detecção e registro do evento.",
        "Triagem inicial e classificação.",
        "Contenção para impedir agravamento.",
        "Preservação de evidências e logs.",
        "Investigação de causa, escopo e dados afetados.",
        "Correção e recuperação.",
        "Avaliação jurídica de risco e necessidade de comunicação.",
        "Comunicação às partes aplicáveis e autoridades, quando exigido.",
        "Lições aprendidas e ações preventivas.",
      ],
    },
    {
      id: "incidente-dados-clinica",
      title: "5. Incidente envolvendo dados da clínica",
      paragraphs: [
        "Quando o sclinic atuar como operador, a equipe responsável deverá informar a clínica controladora sem demora indevida após confirmação razoável de incidente que possa afetar seus dados, fornecendo as informações disponíveis para análise. A clínica decidirá sobre a comunicação ao titular e à ANPD, salvo obrigação legal direta da Prestadora.",
      ],
    },
    {
      id: "incidente-dados-sclinic",
      title: "6. Incidente envolvendo dados controlados pelo sclinic",
      paragraphs: [
        "Quando a Prestadora for controladora, o incidente será tratado de acordo com a LGPD e a Resolução CD/ANPD nº 15/2024, inclusive quanto à análise de risco e eventual comunicação à ANPD e aos titulares dentro dos prazos regulamentares aplicáveis.",
      ],
    },
    {
      id: "conteudo-comunicacao",
      title: "7. Conteúdo mínimo da comunicação",
      paragraphs: [],
      bullets: [
        "Descrição da natureza do incidente.",
        "Categorias e quantidade aproximada de titulares afetados, quando conhecida.",
        "Categorias e quantidade aproximada de dados afetados.",
        "Consequências potenciais e medidas adotadas.",
        "Medidas técnicas e administrativas de contenção e mitigação.",
        "Canal de contato para esclarecimentos.",
      ],
    },
    {
      id: "registro-preservacao",
      title: "8. Registro e preservação",
      paragraphs: [
        "Todo incidente deve possuir registro contendo data, detecção, classificação, responsáveis, evidências, decisões, comunicações e medidas corretivas. O registro deve observar o prazo mínimo de preservação aplicável à regulamentação da ANPD e às necessidades de defesa de direitos.",
      ],
    },
    {
      id: "papeis-internos",
      title: "9. Papéis internos",
      paragraphs: [],
      table: {
        headers: ["Papel", "Responsabilidade"],
        rows: [
          [
            "Tecnologia/SecOps",
            "Detecção, contenção, análise técnica e recuperação",
          ],
          [
            "Privacidade/Encarregado",
            "Coordenação de aspectos de proteção de dados e interface institucional",
          ],
          [
            "Jurídico",
            "Avaliação de obrigações legais e comunicações",
          ],
          [
            "Gestão",
            "Decisões de prioridade, risco, comunicação e continuidade",
          ],
          [
            "Suporte/Customer Success",
            "Comunicação operacional com clientes afetados conforme orientação",
          ],
        ],
      },
    },
    {
      id: "testes-revisao",
      title: "10. Testes e revisão",
      paragraphs: [
        "O procedimento deve ser testado periodicamente, incluindo simulações de vazamento entre tenants, comprometimento de credencial administrativa e indisponibilidade de banco de dados.",
      ],
    },
    {
      id: "referencia",
      title: "11. Referência",
      paragraphs: [
        "Base principal: Resolução CD/ANPD nº 15/2024, além da LGPD e demais normas aplicáveis.",
      ],
    },
  ],
}
