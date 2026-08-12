import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * DPA modelo — aceite pela clínica controladora.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const DATA_PROCESSING_AGREEMENT: LegalDocumentContent = {
  title: "DPA — Acordo de Tratamento de Dados",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Este documento deve ser assinado/aceito pela clínica controladora. Não utilizar como substituto da definição efetiva de responsabilidades, instruções e medidas técnicas da operação concreta. Campos entre colchetes e revisão jurídica são obrigatórios antes da publicação vinculante.",
  sections: [
    {
      id: "partes-escopo",
      title: "1. Partes e escopo",
      paragraphs: [
        "De um lado, a clínica/profissional CONTRATANTE, na qualidade de Controladora; de outro, a Prestadora sclinic, na qualidade de Operadora para os dados tratados em nome da Controladora. Este DPA integra o Contrato SaaS.",
      ],
    },
    {
      id: "objeto-duracao",
      title: "2. Objeto e duração",
      paragraphs: [
        "A Operadora tratará dados pessoais pelo período necessário à prestação do Serviço e aos procedimentos de saída, retenção e exclusão previstos no contrato, instruções da Controladora e legislação aplicável.",
      ],
    },
    {
      id: "dados-titulares",
      title: "3. Dados e titulares",
      paragraphs: [],
      table: {
        headers: ["Categoria", "Exemplos no sclinic"],
        rows: [
          [
            "Titulares",
            "Pacientes, profissionais, colaboradores da clínica, usuários da conta SaaS e demais pessoas cujos dados sejam inseridos pela Controladora",
          ],
          [
            "Dados comuns",
            "Identificação, contato, endereço, documentos, agenda, lista de espera, catálogo de serviços e dados administrativos da clínica",
          ],
          [
            "Dados sensíveis",
            "Notas clínicas, sinais vitais, alertas (alergias/restrições), conteúdo de receitas e declarações de comparecimento e demais dados de saúde inseridos nos módulos disponíveis",
          ],
          [
            "Dados técnicos",
            "Logs, auditoria, metadados de sessão, IP/user-agent e eventos de atualização da recepção (SSE)",
          ],
          [
            "Financeiro clínico (MVP)",
            "Cobranças e pagamentos registrados manualmente pela clínica — sem processamento de cartão do paciente pelo sclinic",
          ],
        ],
      },
    },
    {
      id: "instrucoes-finalidade",
      title: "4. Instruções e finalidade",
      paragraphs: [
        "A Operadora tratará os dados somente para fornecer, manter, proteger e aprimorar tecnicamente o Serviço conforme as instruções documentadas da Controladora. Não utilizará dados clínicos para publicidade, comercialização de bases ou treinamento de modelos de IA por conta própria.",
      ],
    },
    {
      id: "responsabilidades-controladora",
      title: "5. Responsabilidades da Controladora",
      paragraphs: [],
      bullets: [
        "Determinar finalidades e hipóteses legais do tratamento.",
        "Garantir que a coleta e o uso dos dados sejam lícitos e transparentes.",
        "Fornecer avisos e atender solicitações dos titulares.",
        "Definir e revisar acessos de seus usuários.",
        "Fornecer instruções lícitas e suficientes à Operadora.",
        "Avaliar riscos próprios do tratamento clínico e cumprir obrigações regulatórias da atividade de saúde.",
      ],
    },
    {
      id: "responsabilidades-operadora",
      title: "6. Responsabilidades da Operadora",
      paragraphs: [],
      bullets: [
        "Tratar os dados conforme instruções documentadas.",
        "Garantir confidencialidade das pessoas autorizadas.",
        "Aplicar medidas técnicas e administrativas compatíveis com o risco.",
        "Apoiar a Controladora em direitos, segurança e incidentes.",
        "Manter registros e evidências de conformidade proporcional ao tratamento.",
        "Informar a Controladora sobre instruções que, em seu entendimento, contrariem a legislação aplicável, sem prejuízo das medidas necessárias em caso de risco imediato.",
      ],
    },
    {
      id: "seguranca",
      title: "7. Segurança",
      paragraphs: [],
      bullets: [
        "Isolamento lógico entre tenants (clínicas), com validação server-side de membership e recurso.",
        "Controle de acesso baseado em papéis (RBAC) e privilégio mínimo.",
        "Autenticação por e-mail/senha, verificação de e-mail e gestão de sessão.",
        "Proteção de credenciais (hash de senha) e segredos em variáveis de ambiente.",
        "Criptografia em trânsito (HTTPS) e medidas de proteção em repouso conforme a infraestrutura adotada (ex.: Neon).",
        "Logs e auditoria append-only de ações relevantes (sem exposição de segredos).",
        "Soft-delete em registros operacionais e capacidade de recuperação via backups da infraestrutura.",
        "Gestão de vulnerabilidades e atualizações de segurança do stack.",
      ],
    },
    {
      id: "suboperadores",
      title: "8. Suboperadores",
      paragraphs: [
        "A Controladora autoriza o uso de suboperadores necessários à operação do Serviço, desde que submetidos a obrigações de proteção de dados e segurança compatíveis. A Operadora manterá lista atualizada dos suboperadores relevantes e comunicará alterações materiais conforme procedimento contratual.",
      ],
    },
    {
      id: "direitos-titulares",
      title: "9. Direitos dos titulares",
      paragraphs: [
        "A Controladora é responsável pelo atendimento dos titulares. Quando depender de dados ou funcionalidades sob controle da Operadora, esta prestará assistência razoável, considerando o prazo legal e a natureza da solicitação.",
      ],
    },
    {
      id: "incidentes-seguranca",
      title: "10. Incidentes de segurança",
      paragraphs: [
        "A Operadora comunicará a Controladora sem demora indevida após tomar conhecimento de incidente que envolva dados tratados em seu nome e fornecerá, na medida disponível, informações sobre natureza, categorias afetadas, medidas adotadas e recomendações. A Controladora decidirá sobre comunicações a titulares e ANPD, salvo obrigação legal direta da Operadora.",
      ],
    },
    {
      id: "transferencia-internacional",
      title: "11. Transferência internacional",
      paragraphs: [
        "Quando houver transferência internacional, as partes adotarão mecanismo válido nos termos da LGPD e da Resolução CD/ANPD nº 19/2024. A Operadora fornecerá à Controladora informações razoavelmente disponíveis sobre localização, destinatários e salvaguardas contratuais relevantes.",
      ],
    },
    {
      id: "auditoria-comprovacao",
      title: "12. Auditoria e comprovação",
      paragraphs: [
        "A Controladora poderá solicitar informações razoáveis para verificar cumprimento deste DPA. Auditorias presenciais ou técnicas deverão preservar segurança, confidencialidade e segredos comerciais e seguir procedimento previamente acordado, salvo exigência legal ou incidente relevante.",
      ],
    },
    {
      id: "devolucao-exclusao",
      title: "13. Devolução e exclusão",
      paragraphs: [
        "Ao término do Serviço, a Controladora poderá solicitar exportação dos dados em formato disponibilizado. Após o período de saída, a Operadora excluirá ou tornará inacessíveis os dados sob sua responsabilidade, ressalvados backups em ciclo de retenção, obrigações legais e registros necessários à defesa de direitos.",
      ],
    },
    {
      id: "confidencialidade",
      title: "14. Confidencialidade",
      paragraphs: [
        "Dados tratados em nome da Controladora serão considerados confidenciais. Pessoas com acesso deverão estar vinculadas a dever de confidencialidade.",
      ],
    },
    {
      id: "prevalencia",
      title: "15. Prevalência",
      paragraphs: [
        "Para matérias específicas de proteção de dados tratadas neste DPA, este instrumento prevalecerá sobre disposições genéricas do Contrato SaaS na medida de eventual conflito, sem alterar condições comerciais.",
      ],
    },
    {
      id: "anexo-operacional",
      title: "16. Anexo operacional mínimo",
      paragraphs: [],
      table: {
        headers: ["Item", "Preenchimento"],
        rows: [
          ["Controladora", "Nome, CNPJ/CPF e contato"],
          ["Operadora", "[RAZÃO SOCIAL]"],
          [
            "Finalidades",
            "Gestão clínica multi-tenant: pacientes, profissionais, agenda/recepção, prontuário operacional, documentos suportados, cobrança clínica manual e administração, conforme contratação",
          ],
          ["Categorias de dados", "Conforme seção 3"],
          [
            "Suboperadores",
            "Neon, Vercel (incl. Analytics/Speed Insights), Resend, Stripe — conforme lista vigente",
          ],
          [
            "Transferência internacional",
            "Conforme inventário e mecanismo aplicável",
          ],
          [
            "Prazo",
            "Vigência + período de saída + retenções legais/técnicas",
          ],
        ],
      },
    },
    {
      id: "assinatura-aceite",
      title: "17. Assinatura/aceite",
      paragraphs: [
        "O aceite eletrônico do Contrato SaaS ou a assinatura deste DPA produz efeitos entre as partes a partir da data de contratação, sem prejuízo da documentação complementar exigida.",
      ],
    },
  ],
}
