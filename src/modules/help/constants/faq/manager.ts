import { routes } from "@/config/routes"
import {
  SHARED_ACCOUNT_FAQ,
  SHARED_APPOINTMENT_STATUSES,
  SHARED_WHERE_IS_HELP,
} from "@/modules/help/constants/faq/shared"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ para gestor — operação clínica e equipe; sem settings/audit/prontuário em escrita.
 */
export const HELP_FAQ_MANAGER: HelpFaqItem[] = [
  {
    id: "what-is-sclinic-manager",
    categoryId: "getting-started",
    question: "O que eu consigo fazer no sclinic?",
    answer: [
      "Como gestor, você acompanha a operação: pacientes, profissionais, agenda, equipe e recebimentos.",
      "Você pode ver o prontuário (leitura), mas quem escreve evolução e receita é o profissional no atendimento. Configurações da clínica e o plano ficam com admin/proprietário.",
    ],
    keywords: ["gestor", "manager", "o que posso", "permissão"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },
  {
    id: "manager-first-steps",
    categoryId: "getting-started",
    question: "Por onde começo no dia a dia?",
    answer: [
      "Use a home para ver a ocupação do dia. Depois ajuste agenda, pacientes ou equipe conforme a necessidade.",
    ],
    steps: [
      "Abra o Início e veja o fluxo do dia.",
      "Confira Agendamentos e confirme ou remarque o que precisar.",
      "Cadastre pacientes novos em Pacientes.",
      "Se faltar profissional ou colaborador, use Profissionais ou Equipe.",
    ],
    keywords: ["começar", "rotina", "dia"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  SHARED_WHERE_IS_HELP,

  {
    id: "invite-team",
    categoryId: "team",
    question: "Como convido alguém da equipe?",
    answer: [
      "Em Equipe: envie o e-mail e escolha a função. Acompanhe convites pendentes na mesma tela.",
    ],
    keywords: ["convidar", "equipe", "convite"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },
  {
    id: "invite-professional",
    categoryId: "team",
    question: "Como chamo um profissional de saúde?",
    answer: [
      "Em Profissionais. A pessoa completa o cadastro e fica disponível na agenda.",
      "Se o convite for bloqueado por limite do plano, peça ao proprietário para ver Uso do plano.",
    ],
    keywords: ["profissional", "profissional de saúde", "enfermeiro"],
    relatedRoutes: [{ label: "Profissionais", href: routes.professionals }],
  },
  {
    id: "roles-overview",
    categoryId: "team",
    question: "Qual a diferença entre recepção, financeiro e clínico?",
    answer: [
      "Recepção: agenda, pacientes e cobrança no balcão.",
      "Financeiro: lista e gerencia cobranças das consultas.",
      "Profissional de saúde: atende, escreve prontuário e emite documentos clínicos.",
      "Você (gestor) organiza a operação e convida pessoas, sem alterar configurações da clínica.",
    ],
    keywords: ["funções", "papéis", "diferença"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },
  {
    id: "suspend-member",
    categoryId: "team",
    question: "Como suspendo alguém?",
    answer: [
      "Em Equipe você pode suspender ou remover colaboradores. Não dá para alterar o proprietário.",
    ],
    keywords: ["suspender", "remover acesso"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },

  {
    id: "create-patient",
    categoryId: "patients",
    question: "Como cadastro um paciente?",
    answer: [
      "Em Pacientes, use cadastrar. O CPF é único por clínica. Depois você busca na lista.",
    ],
    keywords: ["paciente", "cadastrar", "CPF"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "archive-patient",
    categoryId: "patients",
    question: "Como tiro um paciente da lista ativa?",
    answer: [
      "Arquive o paciente. O histórico permanece na clínica.",
    ],
    keywords: ["arquivar", "remover"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "view-patient-history",
    categoryId: "patients",
    question: "Consigo ver o histórico clínico?",
    answer: [
      "Sim, na ficha do paciente (consultas e, com permissão de leitura, notas). A escrita do prontuário fica com quem atende.",
    ],
    keywords: ["histórico", "ficha", "prontuário", "ler"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "create-appointment",
    categoryId: "appointments",
    question: "Como marco uma consulta?",
    answer: [
      "Em Agendamentos: data, horário, paciente, profissional e, se quiser, o valor da consulta.",
    ],
    keywords: ["agendar", "marcar", "consulta"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  SHARED_APPOINTMENT_STATUSES,
  {
    id: "confirm-reschedule",
    categoryId: "appointments",
    question: "Como confirmo, remarco ou cancelo?",
    answer: [
      "Abra a consulta na agenda. Você pode confirmar, mudar horário ou cancelar enquanto a consulta ainda permitir alteração.",
      "Você também pode excluir agendamentos quando necessário (diferente de profissionais clínicos, que em geral só remarcariam os próprios).",
    ],
    keywords: ["confirmar", "remarcar", "cancelar", "excluir"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "who-starts-attendance",
    categoryId: "appointments",
    question: "Quem inicia o atendimento?",
    answer: [
      "O profissional de saúde inicia na agenda. Você acompanha o status, mas o prontuário em escrita é dele.",
    ],
    keywords: ["iniciar", "atendimento", "quem"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  {
    id: "records-read-only",
    categoryId: "records",
    question: "Consigo escrever no prontuário?",
    answer: [
      "Não. Como gestor você consulta o que foi registrado (leitura). Notas, vitais e receitas são feitos no atendimento pelo profissional.",
    ],
    keywords: ["prontuário", "escrever", "nota", "só leitura"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "how-charges-work",
    categoryId: "billing",
    question: "Como acompanho os recebimentos?",
    answer: [
      "Em Faturamento você vê o que está pendente e o que já foi pago. Também pode registrar pagamento (cobrar) na agenda ou no faturamento.",
      "Cancelar ou gerenciar cobranças de ponta a ponta (como estornos avançados) pode exigir perfil financeiro ou admin — use o que a tela permitir.",
    ],
    keywords: ["faturamento", "receber", "pendente"],
    relatedRoutes: [
      { label: "Faturamento", href: routes.billing },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  {
    id: "mark-charge-paid",
    categoryId: "billing",
    question: "Como registro que o paciente pagou?",
    answer: [
      "Marque a cobrança como paga em Faturamento ou pela agenda, escolhendo a forma (PIX, dinheiro, cartão no balcão).",
    ],
    keywords: ["pago", "PIX", "cobrar"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "saas-vs-clinical",
    categoryId: "billing",
    question: "Isso é a mensalidade do sclinic?",
    answer: [
      "Não. Faturamento é cobrança ao paciente. A assinatura do sistema é do proprietário.",
    ],
    keywords: ["plano", "assinatura", "mensalidade"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },

  {
    id: "no-settings",
    categoryId: "getting-started",
    question: "Por que não vejo Configurações?",
    answer: [
      "Configurações da clínica (nome, horários, receitas, auditoria) são do administrador ou do proprietário.",
      "Se precisar mudar algo, peça a quem tem esse acesso.",
    ],
    keywords: ["configurações", "não vejo", "menu"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  ...SHARED_ACCOUNT_FAQ,
]
