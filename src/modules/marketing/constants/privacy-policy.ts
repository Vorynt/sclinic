import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Rascunho para lançamento — placeholders da empresa controladora.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const PRIVACY_POLICY: LegalDocumentContent = {
  title: "Política de Privacidade",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Este documento é um rascunho operacional alinhado à LGPD (Lei nº 13.709/2018) e ao produto sclinic. Substitua os placeholders e submeta à revisão de um advogado / DPO antes de considerar o texto vinculante.",
  sections: [
    {
      id: "introducao",
      title: "1. Introdução",
      paragraphs: [
        "Esta Política descreve como o sclinic trata dados pessoais no contexto do software de gestão clínica. O controlador institucional do SaaS é [RAZÃO SOCIAL], CNPJ [CNPJ], sede em [ENDEREÇO] (“Prestadora”). Contato para assuntos de privacidade: [E-MAIL LGPD].",
        "Ao utilizar o Serviço, você declara ter ciência desta Política. Termos em maiúsculas não definidos aqui seguem o significado dos Termos de Uso.",
      ],
    },
    {
      id: "papeis-lgpd",
      title: "2. Papéis na LGPD (controlador e operador)",
      paragraphs: [
        "Há dois contextos distintos de tratamento:",
      ],
      bullets: [
        "Conta SaaS e assinatura: a Prestadora é, em regra, controladora dos dados do usuário contratante (cadastro, autenticação, billing da assinatura, suporte).",
        "Dados operacionais da clínica (pacientes, prontuário, agenda, cobrança clínica, equipe): a clínica (ou o profissional responsável) é a controladora; a Prestadora atua como operadora, tratando esses dados sob instruções da clínica e conforme o contrato de uso do software.",
      ],
    },
    {
      id: "dados-coletados",
      title: "3. Quais dados tratamos",
      paragraphs: [
        "Dependendo do uso do Serviço, podemos tratar:",
      ],
      bullets: [
        "Dados de conta e equipe: nome, e-mail, telefone, senha (armazenada de forma criptografada/hash), status, papéis e memberships, IP e user-agent de sessão",
        "Dados da clínica (tenant): nome/razão, documento, contato, endereço, logo, fuso horário e configurações",
        "Dados de profissionais: identificação, conselho profissional, especialidade e vínculos",
        "Dados de pacientes: identificação civil e social, documentos, contatos, endereço, emergência, notas administrativas",
        "Dados sensíveis de saúde: anotações clínicas, sinais vitais, alertas (ex.: alergias), receitas e documentos clínicos",
        "Agenda e atendimento: horários, status, fila/espera e metadados de consulta",
        "Financeiro clínico: cobranças, valores, métodos e vínculos com paciente/consulta (registro operacional da clínica)",
        "Billing SaaS: identificadores de cliente/assinatura junto ao processador de pagamento (Stripe), plano e uso",
        "Auditoria: ator, ação, entidade e alterações (before/after) para rastreabilidade",
      ],
    },
    {
      id: "finalidades",
      title: "4. Finalidades e bases legais",
      paragraphs: [
        "Tratamos dados pessoais para:",
      ],
      bullets: [
        "Prestar e melhorar o Serviço (execução de contrato / legítimo interesse, conforme o caso)",
        "Autenticar usuários, prevenir fraude e manter segurança (legítimo interesse e obrigação legal, quando couber)",
        "Processar assinatura e faturamento SaaS (execução de contrato)",
        "Enviar e-mails transacionais (verificação, reset de senha, convites) (execução de contrato)",
        "Cumprir obrigações legais e regulatórias e exercer direitos em processos",
        "Como operadora da clínica: hospedar e processar dados clínicos e operacionais sob instrução da controladora-clínica (execução de contrato com a clínica; a clínica deve assegurar a base legal perante o titular, inclusive para dados sensíveis de saúde)",
      ],
    },
    {
      id: "compartilhamento",
      title: "5. Compartilhamento e subprocessadores",
      paragraphs: [
        "Não vendemos dados pessoais. Compartilhamos dados apenas quando necessário ao Serviço, com operadores/subprocessadores sob obrigação de confidencialidade e segurança, ou quando exigido por lei. Exemplos atuais de infraestrutura e serviços de apoio:",
      ],
      bullets: [
        "Neon — banco de dados PostgreSQL",
        "Stripe — processamento de pagamento da assinatura SaaS",
        "Resend — envio de e-mails transacionais",
        "Vercel — hospedagem, Analytics e Speed Insights (métricas de uso/performance)",
      ],
    },
    {
      id: "transferencias",
      title: "5.1 Transferências internacionais",
      paragraphs: [
        "Transferências internacionais, se ocorrerem por meio dos provedores acima, observarão mecanismos admitidos pela LGPD (cláusulas contratuais, país adequado etc.), conforme a configuração dos fornecedores.",
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies, sessão e analytics",
      paragraphs: [
        "Utilizamos cookies e tecnologias semelhantes essenciais à autenticação e sessão (Better Auth). Ferramentas de analytics/performance da Vercel podem coletar dados de uso agregados ou pseudonimizados para compreender desempenho do produto.",
        "Você pode gerenciar cookies no navegador; a desativação de cookies essenciais pode impedir o login.",
      ],
    },
    {
      id: "retencao",
      title: "7. Retenção e exclusão",
      paragraphs: [
        "Mantemos dados pelo tempo necessário às finalidades desta Política, ao contrato e a obrigações legais. Diversos registros operacionais usam soft-delete (marcação de exclusão sem remoção imediata) e trilhas de auditoria, o que pode implicar retenção adicional para integridade, segurança e defesa de direitos.",
        "Pedidos de exclusão de conta ou de dados sob responsabilidade da Prestadora como controladora serão atendidos na medida do legalmente possível. Para dados em que a clínica é controladora, o titular deve exercer direitos perante a clínica; a Prestadora apoiará a clínica como operadora.",
      ],
    },
    {
      id: "seguranca",
      title: "8. Segurança",
      paragraphs: [
        "Adotamos medidas técnicas e organizacionais razoáveis, incluindo controle de acesso por papéis (RBAC), isolamento multi-tenant por clínica, autenticação com sessão e registro de auditoria. Nenhum sistema é 100% seguro; pedimos que a clínica também proteja dispositivos, senhas e permissões internas.",
      ],
    },
    {
      id: "direitos",
      title: "9. Direitos do titular",
      paragraphs: [
        "Nos termos da LGPD, o titular pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamentos, revogação de consentimento (quando a base for consentimento) e oposição a tratamentos indevidos.",
        "Para dados da conta SaaS sob controle da Prestadora: contate [E-MAIL LGPD]. Para dados de pacientes/prontuário: dirija-se à clínica controladora; se necessário, a Prestadora encaminhará ou apoiará o atendimento operacional.",
        "É possível petição à Autoridade Nacional de Proteção de Dados (ANPD).",
      ],
    },
    {
      id: "criancas",
      title: "10. Crianças e adolescentes",
      paragraphs: [
        "O cadastro de conta no SaaS destina-se a profissionais e gestores. Dados de pacientes menores podem ser inseridos pela clínica no exercício de sua atividade; a clínica é responsável pela base legal e pelo tratamento adequado desses dados.",
      ],
    },
    {
      id: "alteracoes",
      title: "11. Alterações",
      paragraphs: [
        "Podemos atualizar esta Política para refletir mudanças legais ou do produto. A data de “Última atualização” será revisada e, em alterações relevantes, buscaremos aviso razoável pelos canais do Serviço.",
      ],
    },
    {
      id: "contato",
      title: "12. Contato do encarregado / privacidade",
      paragraphs: [
        "Para exercer direitos ou esclarecer dúvidas sobre privacidade: [E-MAIL LGPD]. Endereço postal: [ENDEREÇO]. Identifique no assunto a referência “LGPD / Privacidade — sclinic”.",
      ],
    },
  ],
}
