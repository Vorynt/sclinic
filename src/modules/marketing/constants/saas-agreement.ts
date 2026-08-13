import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Modelo-base de Contrato SaaS — placeholders e anexos comerciais pendentes.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const SAAS_AGREEMENT: LegalDocumentContent = {
  title: "Contrato SaaS",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Modelo-base. Recomenda-se assinatura eletrônica e preenchimento dos anexos comerciais. A versão final deve refletir SLA, preços, impostos, suporte e limites efetivamente praticados. Campos entre colchetes e revisão jurídica são obrigatórios antes da publicação vinculante.",
  sections: [
    {
      id: "partes",
      title: "1. Partes",
      paragraphs: [
        "CONTRATADA: [RAZÃO SOCIAL], CNPJ [CNPJ], sede em [ENDEREÇO].",
        "CONTRATANTE: dados cadastrais da clínica ou profissional constantes da proposta, ordem de contratação ou cadastro contratual.",
      ],
    },
    {
      id: "objeto",
      title: "2. Objeto",
      paragraphs: [
        "Prestação de acesso ao software sclinic em modelo SaaS multi-clínica, incluindo os módulos e limites (cotas) do plano contratado — tipicamente: pacientes, profissionais, agenda/recepção, prontuário operacional, cobrança clínica por registro manual, auditoria, configurações e gestão da assinatura. O acesso é concedido durante a vigência; não há transferência de código ou licença de instalação salvo contratação expressa.",
        "No MVP, a assinatura SaaS vincula-se à clínica owned pelo contratante (relação 1:1 usuário proprietário ↔ clínica). Trial e condições comerciais seguem a página de planos, o Checkout Stripe e o Customer Portal.",
      ],
    },
    {
      id: "plano-preco-cobranca",
      title: "3. Plano, preço e cobrança",
      paragraphs: [],
      bullets: [
        "Plano e preço: conforme catálogo de planos, Checkout Stripe, proposta ou pedido de contratação.",
        "Ciclo de cobrança: mensal, anual ou outro definido no pedido/plano Stripe.",
        "Trial: quando oferecido (ex.: período de avaliação na primeira assinatura), conforme configuração comercial vigente.",
        "Tributos: tratados conforme legislação e natureza da operação.",
        "Inadimplência e entitlement: restrição/suspensão do acesso conforme status da assinatura (ex.: unpaid/canceled), preservando procedimentos de exportação e obrigações de retenção quando aplicáveis; modo over_limit pode restringir novos convites/profissionais sem apagar dados existentes.",
      ],
    },
    {
      id: "obrigacoes-contratada",
      title: "4. Obrigações da Contratada",
      paragraphs: [],
      bullets: [
        "Disponibilizar o Serviço conforme o plano contratado.",
        "Aplicar medidas técnicas e administrativas compatíveis com o risco.",
        "Processar dados pessoais conforme a LGPD, Política de Privacidade e DPA.",
        "Manter controles de acesso, logs, backups e procedimentos de resposta a incidentes compatíveis com o Serviço.",
        "Informar alterações materiais e indisponibilidades relevantes quando apropriado.",
      ],
    },
    {
      id: "obrigacoes-contratante",
      title: "5. Obrigações da Contratante",
      paragraphs: [],
      bullets: [
        "Utilizar o Serviço de acordo com a lei e os Termos de Uso.",
        "Definir finalidades e hipóteses legais para os dados de seus pacientes.",
        "Fornecer instruções lícitas e documentadas para o tratamento de dados.",
        "Gerir contas, perfis, permissões e acessos de sua equipe.",
        "Manter seus próprios processos clínicos, documentos, consentimentos e registros regulatórios.",
        "Notificar a Contratada quando identificar incidente, acesso indevido ou instrução incorreta.",
      ],
    },
    {
      id: "protecao-dados-dpa",
      title: "6. Proteção de dados e DPA",
      paragraphs: [
        "As partes reconhecem que a Contratada poderá atuar como controladora em tratamentos relacionados à própria relação SaaS e como operadora nos dados clínicos e operacionais da Contratante. O Anexo de Tratamento de Dados (DPA) integra este contrato para as operações em que a Contratada atuar como operadora.",
      ],
    },
    {
      id: "suboperadores",
      title: "7. Suboperadores",
      paragraphs: [
        "A Contratada poderá contratar suboperadores necessários ao Serviço, observando confidencialidade, segurança e mecanismos de transferência internacional quando aplicáveis. A lista de suboperadores será mantida em canal apropriado e poderá ser atualizada conforme o procedimento definido no DPA.",
      ],
    },
    {
      id: "seguranca-incidentes",
      title: "8. Segurança e incidentes",
      paragraphs: [
        "A Contratada manterá medidas de segurança compatíveis com a natureza do Serviço. Em incidente que afete dados tratados em nome da Contratante, a Contratada comunicará a Contratante sem demora indevida e cooperará com a avaliação e resposta, conforme o DPA.",
      ],
    },
    {
      id: "disponibilidade-suporte",
      title: "9. Disponibilidade, suporte e manutenção",
      paragraphs: [
        "Níveis de serviço, janelas de manutenção e canais de suporte constarão do plano contratado, proposta ou SLA específico. Na ausência de SLA, a Contratada adotará esforços comercialmente razoáveis para manter disponibilidade e atendimento adequados.",
      ],
    },
    {
      id: "vigencia-encerramento",
      title: "10. Vigência e encerramento",
      paragraphs: [
        "A vigência inicia-se na contratação e permanece pelo período contratado, com renovação conforme plano. Qualquer parte poderá rescindir em hipóteses previstas neste instrumento ou na proposta, observados aviso prévio, inadimplência e demais condições comerciais.",
      ],
    },
    {
      id: "portabilidade-saida",
      title: "11. Portabilidade e saída",
      paragraphs: [
        "Ao término, a Contratante poderá solicitar exportação dos dados em formatos disponibilizados pelo Serviço, observadas limitações técnicas, segurança, confidencialidade e dados de terceiros. Após o período de saída, a exclusão seguirá a Política de Retenção e Exclusão, ressalvadas obrigações de preservação.",
      ],
    },
    {
      id: "propriedade-intelectual",
      title: "12. Propriedade intelectual",
      paragraphs: [
        "A Contratada mantém os direitos sobre o software e materiais do sclinic. A Contratante mantém direitos e responsabilidades sobre seus conteúdos e dados, sem prejuízo dos tratamentos legítimos realizados pela Contratada como controladora.",
      ],
    },
    {
      id: "confidencialidade",
      title: "13. Confidencialidade",
      paragraphs: [
        "As partes preservarão informações confidenciais obtidas em razão do contrato, usando-as apenas para execução, segurança, suporte, cumprimento legal e defesa de direitos. A obrigação permanece após o término enquanto a informação conservar caráter confidencial.",
      ],
    },
    {
      id: "limitacao-responsabilidade",
      title: "14. Limitação de responsabilidade",
      paragraphs: [
        "A responsabilidade contratual será definida conforme perdas efetivamente comprovadas e limites válidos na legislação e no contrato comercial. Nenhuma cláusula autoriza exclusão de responsabilidade legalmente irrenunciável.",
      ],
    },
    {
      id: "lei-foro",
      title: "15. Lei aplicável e foro",
      paragraphs: [
        "Aplica-se a legislação brasileira. Foro: [COMARCA/UF], salvo regra legal obrigatória diversa.",
      ],
    },
    {
      id: "documentos-integrados",
      title: "16. Documentos integrados",
      paragraphs: [],
      bullets: [
        "Termos de Uso.",
        "Política de Privacidade.",
        "Política de Cookies.",
        "DPA / Anexo de Tratamento de Dados.",
        "SLA ou condições comerciais, quando houver.",
      ],
    },
  ],
}
