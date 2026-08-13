import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Rascunho para lançamento — placeholders da empresa controladora.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const PRIVACY_POLICY: LegalDocumentContent = {
  title: "Política de Privacidade",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Documento externo. Os campos entre colchetes devem ser preenchidos antes da publicação. Esta política não substitui o DPA/Contrato de Tratamento de Dados celebrado com a clínica controladora. Revisão jurídica obrigatória antes de considerar o texto vinculante.",
  sections: [
    {
      id: "identificacao-escopo",
      title: "1. Identificação e escopo",
      paragraphs: [
        "A [RAZÃO SOCIAL], inscrita no CNPJ sob nº [CNPJ], com sede em [ENDEREÇO] (“Prestadora”), disponibiliza o sclinic, software SaaS multi-clínica de gestão clínica (“Serviço”), incluindo, conforme o plano contratado: cadastro de pacientes e profissionais, agenda e lista de espera, atendimento/prontuário operacional (notas, sinais vitais, alertas), documentos clínicos suportados (receita e declaração de comparecimento), cobrança clínica por registro manual, recepção em tempo quase real, auditoria, configurações da clínica e assinatura do software. Canal de privacidade: [E-MAIL LGPD].",
        "Esta Política explica como dados pessoais são tratados no contexto do Serviço e como a Prestadora atua conforme o contexto de tratamento. Termos em maiúsculas não definidos nesta Política seguem os Termos de Uso e/ou Contrato SaaS aplicáveis.",
      ],
    },
    {
      id: "papeis-controlador-operador",
      title: "2. Papéis de controlador e operador",
      paragraphs: [
        "A qualificação jurídica depende da operação de tratamento. A mesma entidade pode atuar como controladora em determinados tratamentos e como operadora em outros.",
        "A clínica ou o profissional controlador permanece responsável por definir as finalidades e hipóteses legais aplicáveis aos dados de seus pacientes. A Prestadora processa esses dados de acordo com instruções documentadas, o contrato e as configurações do Serviço.",
      ],
      table: {
        headers: ["Contexto", "Papel da Prestadora", "Controlador principal"],
        rows: [
          [
            "Conta SaaS, cadastro, autenticação, assinatura, cobrança da própria assinatura e suporte",
            "Controladora",
            "Prestadora",
          ],
          [
            "Dados operacionais da clínica, incluindo pacientes, agenda, prontuário e informações administrativas inseridas pela clínica",
            "Operadora",
            "Clínica ou profissional que determine finalidades e meios essenciais",
          ],
          [
            "Serviços de terceiros e subprocessadores",
            "Definido conforme o fluxo e a função efetivamente desempenhada",
            "Conforme a atividade e o contrato com o terceiro",
          ],
        ],
      },
    },
    {
      id: "categorias-dados",
      title: "3. Categorias de dados",
      paragraphs: [
        "Dependendo do uso efetivo do Serviço pela clínica, podemos tratar as categorias abaixo. O sclinic não oferece, no estado atual do produto, portal do paciente, inventário/estoque, gateway de pagamento clínico (PIX/cartão in-app), WhatsApp/mensageria nem upload genérico de arquivos clínicos em armazenamento de objetos.",
      ],
      bullets: [
        "Conta e autenticação: nome, e-mail, telefone, senha (armazenada com hash), verificação de e-mail, status, papéis/memberships por clínica, clínica ativa na sessão, IP, user-agent, tokens de sessão e registros de acesso; convites de equipe e de profissionais.",
        "Dados da clínica (tenant): razão social/nome, nome fantasia, CNPJ/documento, contatos, endereço, logotipo, website, fuso horário, status de assinatura e configurações (horários, serviços, layouts de receita).",
        "Profissionais: identificação, tipo de profissão, pronome de tratamento, conselho (tipo/número/UF), especialidade, biografia, vínculo e status na clínica.",
        "Pacientes: nome, nome social, CPF/documento, e-mail, telefone, data de nascimento, gênero, contatos de emergência, endereço, notas administrativas e status (incluindo arquivamento/soft-delete), conforme inseridos pela clínica.",
        "Dados pessoais sensíveis de saúde: notas clínicas do atendimento, sinais vitais, alertas clínicos (ex.: alergias/restrições), conteúdo de receitas e declarações de comparecimento e demais informações de saúde que a clínica registre nos módulos disponíveis.",
        "Agenda e atendimento: horários, status do agendamento, modalidade (presencial/online), motivo, bloqueios de agenda, lista de espera, metadados de atendimento e eventos técnicos de atualização da recepção (incluindo conexão em tempo quase real).",
        "Financeiro clínico: cobranças vinculadas a atendimentos, valores, descontos, vencimento, status, métodos de pagamento registrados manualmente (ex.: dinheiro, PIX manual) e catálogo de serviços da clínica. O MVP não processa pagamento do paciente por gateway integrado; dados completos de cartão do paciente não são coletados pelo sclinic.",
        "Billing SaaS: identificadores de cliente/assinatura Stripe, plano, cotas, trial, status de pagamento e eventos de webhook do processador da assinatura do software.",
        "Auditoria e segurança: ator, ação, entidade, timestamps, alterações relevantes (sem segredos) e metadados técnicos necessários à rastreabilidade.",
      ],
    },
    {
      id: "dados-sensiveis-saude",
      title: "4. Dados sensíveis de saúde",
      paragraphs: [
        "Dados referentes à saúde são dados pessoais sensíveis. O sclinic não utiliza prontuários e demais dados clínicos para publicidade comportamental, comercialização de bases, enriquecimento de cadastros ou treinamento de modelos de inteligência artificial, salvo se houver tratamento especificamente previsto em instrumento jurídico e hipótese legal aplicável, de forma compatível com a LGPD.",
        "Quando a Prestadora atuar como operadora, a clínica é responsável por determinar a finalidade, a hipótese legal e as condições de utilização dos dados clínicos. A Prestadora limita o processamento ao necessário para fornecer o Serviço, cumprir instruções documentadas e atender obrigações legais aplicáveis.",
      ],
    },
    {
      id: "finalidades-bases-legais",
      title: "5. Finalidades e bases legais",
      paragraphs: [
        "Quando o consentimento for a base legal aplicável, o tratamento observará os requisitos legais específicos e o titular poderá revogá-lo nos termos da LGPD, sem prejuízo dos efeitos de tratamentos realizados anteriormente.",
      ],
      table: {
        headers: ["Tratamento", "Finalidade", "Base legal — regra geral"],
        rows: [
          [
            "Conta e autenticação",
            "Criar e administrar a conta, autenticar usuários e manter sessões",
            "Execução de contrato e, conforme o caso, legítimo interesse/obrigação legal",
          ],
          [
            "Segurança e prevenção a fraude",
            "Detectar abuso, acessos indevidos, incidentes e ameaças",
            "Legítimo interesse e/ou obrigação legal",
          ],
          [
            "Assinatura e billing SaaS",
            "Contratar, cobrar, renovar e administrar o plano",
            "Execução de contrato e/ou obrigação legal",
          ],
          [
            "E-mails transacionais",
            "Verificação, recuperação de acesso, convites e comunicações necessárias ao serviço",
            "Execução de contrato e/ou legítimo interesse, conforme a mensagem",
          ],
          [
            "Dados clínicos da clínica",
            "Hospedagem e processamento de pacientes, agenda, prontuário operacional e cobrança clínica manual sob instruções da controladora",
            "Hipótese legal definida pela clínica; a Prestadora atua como operadora",
          ],
          [
            "Operação e recepção",
            "Atualização quase em tempo real do board de recepção e disponibilidade da agenda",
            "Execução de contrato / legítimo interesse operacional da controladora, conforme o caso",
          ],
          [
            "Auditoria e registros",
            "Rastreabilidade, segurança, defesa de direitos e cumprimento de obrigações",
            "Legítimo interesse e/ou obrigação legal, conforme o registro",
          ],
        ],
      },
    },
    {
      id: "compartilhamento-subprocessadores",
      title: "6. Compartilhamento e subprocessadores",
      paragraphs: [
        "A Prestadora não comercializa dados pessoais de pacientes para publicidade ou formação de bases comerciais. Compartilhamentos limitam-se ao necessário à prestação do Serviço, ao cumprimento de obrigações legais, à segurança, ao exercício regular de direitos ou a instruções da controladora.",
        "A lista de fornecedores poderá ser atualizada para refletir mudanças operacionais. Quando necessário, alterações relevantes serão comunicadas conforme contrato e legislação aplicáveis.",
      ],
      table: {
        headers: ["Fornecedor/serviço", "Finalidade", "Observação"],
        rows: [
          [
            "Neon",
            "Banco de dados PostgreSQL (serverless)",
            "Persistência dos dados do Serviço; região e condições conforme configuração e contrato vigentes",
          ],
          [
            "Vercel",
            "Hospedagem da aplicação, Analytics e Speed Insights",
            "Execução do app Next.js e métricas de desempenho/uso da interface (sem conteúdo de prontuário)",
          ],
          [
            "Resend",
            "E-mails transacionais",
            "Verificação de e-mail, recuperação de senha, convites e comunicações necessárias ao Serviço",
          ],
          [
            "Stripe",
            "Assinatura e pagamentos do SaaS",
            "Checkout, Customer Portal, webhooks e cobrança do plano da Prestadora — não processa cobrança clínica do paciente no MVP",
          ],
        ],
      },
    },
    {
      id: "transferencias-internacionais",
      title: "7. Transferências internacionais",
      paragraphs: [
        "Quando houver transferência internacional de dados, a Prestadora adotará mecanismo válido previsto na LGPD e na regulamentação da ANPD, considerando, conforme o caso, decisão de adequação, cláusulas-padrão contratuais, normas corporativas globais ou outra hipótese legal aplicável. O controlador verificará a base legal e o mecanismo de transferência; a operadora prestará as informações de que dispuser para essa avaliação.",
      ],
    },
    {
      id: "cookies-sessao",
      title: "8. Cookies, sessão e tecnologias semelhantes",
      paragraphs: [
        "O Serviço utiliza cookie/sessão de autenticação (Better Auth), preferências técnicas de interface quando aplicáveis (ex.: estado da barra lateral) e, na configuração atual, Vercel Analytics e Speed Insights para desempenho. Detalhes, categorias e gestão constam da Política de Cookies. A desativação de tecnologias essenciais pode impedir login e manutenção da sessão.",
      ],
    },
    {
      id: "retencao-exclusao-backups",
      title: "9. Retenção, exclusão e backups",
      paragraphs: [
        "Os dados são mantidos pelo período necessário às finalidades informadas, ao contrato e às obrigações legais. Determinados registros podem utilizar exclusão lógica (soft-delete) e trilhas de auditoria. Backups seguem ciclos próprios de retenção e podem permanecer por período limitado após uma exclusão lógica, protegidos contra uso operacional indevido.",
        "Quando a Prestadora atuar como controladora, pedidos de exclusão serão avaliados conforme a LGPD e demais obrigações legais. Quando atuar como operadora, a solicitação será tratada por meio da clínica controladora, salvo obrigação legal direta da Prestadora.",
      ],
    },
    {
      id: "direitos-titulares",
      title: "10. Direitos dos titulares",
      paragraphs: [
        "Nos termos e limites da LGPD e da regulamentação aplicável, o titular poderá solicitar, conforme o caso, confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre compartilhamentos, revogação do consentimento e oposição a tratamentos realizados em desconformidade.",
        "Para dados sob responsabilidade da Prestadora como controladora: [E-MAIL LGPD]. Para dados clínicos controlados pela clínica: o titular deverá preferencialmente dirigir-se à clínica controladora; a Prestadora prestará apoio operacional quando solicitado.",
        "O titular também poderá apresentar petição à Autoridade Nacional de Proteção de Dados — ANPD, nos termos da legislação aplicável.",
      ],
    },
    {
      id: "seguranca",
      title: "11. Segurança",
      paragraphs: [
        "A Prestadora adota medidas técnicas e administrativas proporcionais ao risco, incluindo autenticação por e-mail/senha com verificação, controle de acesso por papéis (RBAC) e memberships, isolamento lógico multi-tenant entre clínicas (incluindo políticas no banco), autorização server-side, princípio do menor privilégio, auditoria append-only de ações relevantes, proteção de credenciais (hash de senha), soft-delete em registros operacionais, backups da infraestrutura e procedimentos de resposta a incidentes. Nenhum sistema é absolutamente seguro; clínicas e usuários também devem proteger dispositivos, credenciais e permissões.",
      ],
    },
    {
      id: "incidentes-seguranca",
      title: "12. Incidentes de segurança",
      paragraphs: [
        "A Prestadora mantém procedimento de resposta a incidentes. Quando atuar como operadora, comunicará a clínica controladora sem demora indevida e com as informações de que dispuser para permitir que ela avalie e cumpra as obrigações perante titulares e ANPD. Quando atuar como controladora, seguirá diretamente os requisitos legais e regulamentares aplicáveis.",
      ],
    },
    {
      id: "criancas-adolescentes",
      title: "13. Crianças e adolescentes",
      paragraphs: [
        "O cadastro de contas do Serviço é destinado a profissionais, gestores e colaboradores autorizados. Dados de pacientes crianças e adolescentes podem ser inseridos pela clínica no exercício de sua atividade. Nessas hipóteses, a clínica é responsável pelo tratamento adequado, pelas informações fornecidas aos responsáveis e pelo atendimento ao melhor interesse da criança e do adolescente, observada a LGPD e demais legislação aplicável.",
      ],
    },
    {
      id: "encarregado-canal",
      title: "14. Encarregado e canal de privacidade",
      paragraphs: [
        "Encarregado: [NOME OU EMPRESA DO ENCARREGADO]. Canal: [E-MAIL LGPD]. Endereço: [ENDEREÇO]. O contato poderá ser utilizado para dúvidas de privacidade, solicitações de titulares e comunicações relacionadas à LGPD.",
      ],
    },
    {
      id: "alteracoes",
      title: "15. Alterações",
      paragraphs: [
        "Esta Política poderá ser atualizada para refletir alterações legais, regulatórias, operacionais ou do produto. A versão publicada informará a data da última atualização e, quando apropriado, alterações relevantes serão comunicadas por meios razoáveis.",
      ],
    },
    {
      id: "referencias-normativas",
      title: "Referências normativas principais",
      paragraphs: [],
      bullets: [
        "Lei nº 13.709/2018 (LGPD), especialmente arts. 5º, 6º, 7º, 11, 18, 33 a 36, 41, 46 a 49.",
        "Resolução CD/ANPD nº 18/2024 — Regulamento sobre a atuação do encarregado pelo tratamento de dados pessoais.",
        "Resolução CD/ANPD nº 15/2024 — Regulamento de Comunicação de Incidente de Segurança.",
        "Resolução CD/ANPD nº 19/2024 — Regulamento de Transferência Internacional de Dados e cláusulas-padrão contratuais.",
        "Resolução CD/ANPD nº 2/2022, com alterações posteriores — agentes de tratamento de pequeno porte, quando aplicável.",
        "Guia Orientativo da ANPD sobre Cookies e Proteção de Dados Pessoais, quando aplicável à operação.",
      ],
    },
  ],
}
