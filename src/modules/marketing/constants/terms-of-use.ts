import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

/**
 * Rascunho para lançamento — placeholders da empresa prestadora.
 * Revisão jurídica obrigatória antes de uso produtivo.
 */
export const TERMS_OF_USE: LegalDocumentContent = {
  title: "Termos de Uso",
  lastUpdated: "12 de agosto de 2026",
  disclaimer:
    "Os Termos de Uso devem ser harmonizados com o Contrato SaaS assinado/aceito pela clínica. Em caso de conflito, defina no contrato qual instrumento prevalece para cada matéria. Campos entre colchetes e revisão jurídica são obrigatórios antes da publicação vinculante.",
  sections: [
    {
      id: "objeto",
      title: "1. Objeto",
      paragraphs: [
        "O sclinic, disponibilizado por [RAZÃO SOCIAL], é um software SaaS multi-clínica de gestão clínica destinado a clínicas, profissionais e equipes autorizadas. Conforme o plano contratado, o Serviço pode incluir: autenticação e convites; cadastro de pacientes e profissionais; agenda (calendário, bloqueios, lista de espera, modalidade presencial/online); atendimento/prontuário operacional (notas clínicas, sinais vitais, alertas); documentos clínicos suportados (receita e declaração de comparecimento, com impressão HTML); cobrança clínica por registro manual; board de recepção com atualização em tempo quase real; auditoria; configurações da clínica; e gestão da assinatura do software (planos, cotas e portal de cobrança).",
        "Funcionalidades previstas em roadmap (por exemplo inventário, gateway de pagamento clínico, portal do paciente, atestado/solicitação de exames ou mensageria) só passam a integrar o Serviço quando disponibilizadas e comunicadas.",
      ],
    },
    {
      id: "aceitacao",
      title: "2. Aceitação",
      paragraphs: [
        "Ao criar uma conta, contratar um plano ou utilizar o Serviço, o usuário declara possuir capacidade e poderes necessários para aceitar estes Termos e cumprir a legislação aplicável.",
      ],
    },
    {
      id: "conta-acesso-seguranca",
      title: "3. Conta, acesso e segurança",
      paragraphs: [
        "Cada credencial deve ser utilizada por uma única pessoa, salvo mecanismo de acesso expressamente previsto pelo Serviço.",
        "O titular da conta deve manter credenciais, dispositivos, e-mails e métodos de recuperação seguros.",
        "A clínica é responsável por criar, revisar e revogar acessos de sua equipe e por configurar papéis e permissões de forma adequada.",
        "O sclinic poderá bloquear ou suspender acessos quando necessário para segurança, prevenção de fraude, cumprimento legal ou proteção do Serviço.",
      ],
    },
    {
      id: "uso-clinico",
      title: "4. Uso clínico e responsabilidade profissional",
      paragraphs: [
        "O Serviço é ferramenta de apoio à gestão e não substitui a avaliação, julgamento, responsabilidade ou decisão do profissional de saúde. A clínica e os profissionais continuam responsáveis por prontuários, prescrições, registros, consentimentos, protocolos, obrigações regulatórias e decisões clínicas.",
      ],
    },
    {
      id: "cobranca-clinica",
      title: "5. Dados de pacientes e cobrança clínica",
      paragraphs: [
        "A clínica declara possuir legitimidade para inserir e tratar os dados no Serviço e deve fornecer aos titulares as informações exigidas pela legislação. Quando a Prestadora atua como operadora, o tratamento ocorre conforme o DPA e instruções da clínica controladora.",
        "O módulo financeiro clínico registra cobranças e pagamentos de forma operacional (métodos manuais). No estado atual do produto, o sclinic não processa pagamento do paciente via gateway integrado; a clínica permanece responsável pelos meios de cobrança externos que utilizar.",
      ],
    },
    {
      id: "condutas-vedadas",
      title: "6. Condutas vedadas",
      paragraphs: [],
      bullets: [
        "Tentar acessar dados, contas ou tenants (clínicas) sem autorização.",
        "Explorar vulnerabilidades, interferir no funcionamento, introduzir código malicioso ou realizar testes de segurança não autorizados.",
        "Utilizar o Serviço para finalidades ilícitas, fraudulentas ou incompatíveis com a documentação.",
        "Compartilhar credenciais ou conceder permissões além do necessário à função (papéis RBAC).",
        "Usar dados clínicos de outros titulares para finalidade incompatível com a atividade clínica ou com a legislação.",
      ],
    },
    {
      id: "disponibilidade-mudancas",
      title: "7. Disponibilidade e mudanças",
      paragraphs: [
        "O Serviço poderá passar por manutenção, atualizações e alterações. Quando houver indisponibilidade programada relevante, a Prestadora buscará comunicação razoável. Funcionalidades de terceiros podem depender de suas próprias condições e disponibilidade.",
      ],
    },
    {
      id: "propriedade-intelectual",
      title: "8. Propriedade intelectual",
      paragraphs: [
        "Software, marca, código, interfaces, documentação e demais elementos do sclinic pertencem à Prestadora ou a seus licenciantes e não são transferidos ao cliente. A clínica mantém os direitos sobre seus dados e conteúdo inserido no Serviço.",
      ],
    },
    {
      id: "privacidade-protecao-dados",
      title: "9. Privacidade e proteção de dados",
      paragraphs: [
        "O tratamento de dados pessoais observará a Política de Privacidade, o DPA e demais documentos aplicáveis. A qualificação de controlador e operador será determinada conforme a operação realizada.",
      ],
    },
    {
      id: "rescisao-encerramento",
      title: "10. Rescisão e encerramento",
      paragraphs: [
        "No encerramento da contratação, os dados da clínica serão tratados conforme o Contrato SaaS e a Política de Retenção e Exclusão, considerando exportação, exclusão, obrigações legais, backups e registros necessários à defesa de direitos.",
      ],
    },
    {
      id: "limitacoes-responsabilidades",
      title: "11. Limitações e responsabilidades",
      paragraphs: [
        "As partes responderão nos limites previstos na legislação e no contrato aplicável. Nenhuma disposição destes Termos exclui responsabilidade que não possa ser excluída por lei.",
      ],
    },
    {
      id: "lei-foro",
      title: "12. Lei e foro",
      paragraphs: [
        "Estes Termos serão interpretados de acordo com as leis brasileiras. Fica eleito o foro de [COMARCA/UF], salvo disposição legal imperativa em sentido diverso.",
      ],
    },
    {
      id: "contato",
      title: "13. Contato",
      paragraphs: [
        "Suporte: [E-MAIL DE SUPORTE]. Privacidade: [E-MAIL LGPD].",
      ],
    },
    {
      id: "atualizacao",
      title: "14. Atualização",
      paragraphs: [
        "A versão vigente será disponibilizada no Serviço, com indicação de data de atualização. Alterações materiais serão comunicadas quando razoavelmente necessário.",
      ],
    },
  ],
}
