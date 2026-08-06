import { routes } from "@/config/routes"
import {
  SHARED_ACCOUNT_FAQ,
  SHARED_APPOINTMENT_STATUSES,
  SHARED_WHERE_IS_HELP,
} from "@/modules/help/constants/faq/shared"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ para recepcionista — balcão: pacientes, agenda, cobrança; sem prontuário / settings.
 */
export const HELP_FAQ_RECEPTIONIST: HelpFaqItem[] = [
  {
    id: "what-is-sclinic-reception",
    categoryId: "getting-started",
    question: "Para que serve o sclinic na recepção?",
    answer: [
      "É a ferramenta do balcão: cadastrar pacientes, marcar e confirmar consultas, acompanhar o quadro do dia e registrar pagamentos.",
      "Você não inicia o atendimento clínico nem vê o prontuário — isso fica com os profissionais de saúde.",
    ],
    keywords: ["recepção", "balcão", "para que serve"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },
  {
    id: "reception-day-flow",
    categoryId: "getting-started",
    question: "Como funciona meu dia típico?",
    answer: [
      "Na home você vê o quadro do dia: próximos, em atendimento e aguardando pagamento. A tela atualiza quando a clínica muda de status.",
    ],
    steps: [
      "Cadastre ou encontre o paciente.",
      "Marque ou confirme a consulta (pode informar o valor).",
      "Acompanhe no quadro quem chegou e quem o profissional está atendendo.",
      "Quando a consulta for concluída, registre o pagamento se ainda estiver pendente.",
    ],
    keywords: ["fluxo", "quadro", "dia", "rotina", "board"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  SHARED_WHERE_IS_HELP,
  {
    id: "quick-actions-home",
    categoryId: "getting-started",
    question: "O que são as ações rápidas no início?",
    answer: [
      "Atalhos para abrir o formulário de novo agendamento, novo paciente ou a agenda completa — sem precisar caçar no menu.",
    ],
    keywords: ["atalho", "ações rápidas", "novo"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  {
    id: "create-patient",
    categoryId: "patients",
    question: "Como cadastro um paciente?",
    answer: [
      "Em Pacientes (ou pelo atalho Novo paciente no início). O CPF não pode se repetir na mesma clínica.",
      "Depois use a busca na lista para achar a pessoa na hora de marcar.",
    ],
    steps: [
      "Abra Pacientes ou use Novo paciente na home.",
      "Preencha os dados e salve.",
      "Na próxima vez, busque pelo nome ou CPF.",
    ],
    keywords: ["paciente", "cadastrar", "CPF", "novo"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "find-patient",
    categoryId: "patients",
    question: "Como acho um paciente já cadastrado?",
    answer: [
      "Na lista de Pacientes, use a busca. Também dá para escolher o paciente ao criar o agendamento.",
    ],
    keywords: ["buscar", "encontrar", "lista"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "archive-patient",
    categoryId: "patients",
    question: "Posso apagar um paciente?",
    answer: [
      "Você pode arquivar. Ele sai da lista do dia a dia, mas o histórico fica na clínica.",
    ],
    keywords: ["arquivar", "excluir", "remover"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "no-records-access",
    categoryId: "patients",
    question: "Por que não vejo notas ou receitas do paciente?",
    answer: [
      "O prontuário clínico é restrito a quem atende (profissional de saúde) e a papéis de gestão com essa permissão.",
      "Na recepção o foco é cadastro, agenda e pagamento — isso protege os dados clínicos.",
    ],
    keywords: ["prontuário", "nota", "receita", "não vejo"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "create-appointment",
    categoryId: "appointments",
    question: "Como marco uma consulta?",
    answer: [
      "Em Agendamentos (ou Novo agendamento na home): escolha data, horário, paciente e profissional.",
      "Se já souber o valor, informe — facilita cobrar depois.",
    ],
    steps: [
      "Abra a agenda ou o atalho Novo agendamento.",
      "Preencha paciente, profissional, horário e valor (opcional).",
      "Salve — a consulta nasce como Agendada.",
    ],
    keywords: ["marcar", "agendar", "consulta", "horário"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  SHARED_APPOINTMENT_STATUSES,
  {
    id: "confirm-appointment",
    categoryId: "appointments",
    question: "O paciente confirmou. O que faço?",
    answer: [
      "Abra a consulta e marque como Confirmada. Assim o quadro e a equipe veem quem deve aparecer.",
    ],
    keywords: ["confirmar", "confirmada", "ligou"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "reschedule-cancel",
    categoryId: "appointments",
    question: "Como remarco, cancelo ou marco falta?",
    answer: [
      "Abra a consulta na agenda. Remarque o horário, cancele ou use Faltou se a pessoa não veio.",
      "Consultas já concluídas não voltam para remarcar.",
    ],
    keywords: ["remarcar", "cancelar", "faltou", "reagendar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "cannot-start-attendance",
    categoryId: "appointments",
    question: "Por que não consigo iniciar o atendimento?",
    answer: [
      "Iniciar atendimento é do profissional clínico. Seu papel é organizar a fila e o pagamento.",
      "Quando o profissional de saúde inicia e conclui, a consulta pode aparecer em Aguardando pagamento no quadro.",
    ],
    keywords: ["iniciar", "atendimento", "bloqueado", "em atendimento"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  {
    id: "board-columns",
    categoryId: "appointments",
    question: "O que significa cada coluna do quadro do dia?",
    answer: [
      "Próximos: consultas agendadas ou confirmadas de hoje.",
      "Em atendimento: o profissional já iniciou.",
      "Aguardando pagamento: consulta concluída com cobrança ainda em aberto.",
    ],
    keywords: ["quadro", "colunas", "próximos", "pagamento", "board"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  {
    id: "collect-payment",
    categoryId: "billing",
    question: "Como registro o pagamento no balcão?",
    answer: [
      "Pelo quadro do dia (Receber) ou pela consulta na agenda: marque como pago e escolha a forma (PIX, dinheiro, cartão no balcão, etc.).",
      "Você não precisa da tela completa de Faturamento — a cobrança no balcão já cobre o dia a dia.",
    ],
    steps: [
      "Encontre a consulta em Aguardando pagamento ou na agenda.",
      "Toque para receber / marcar como pago.",
      "Escolha a forma de pagamento e confirme.",
    ],
    keywords: ["pagar", "receber", "PIX", "dinheiro", "cobrar", "balcão"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  {
    id: "set-appointment-value",
    categoryId: "billing",
    question: "Esqueci de colocar o valor ao marcar. E agora?",
    answer: [
      "Você ainda pode registrar ou ajustar a cobrança ao receber o pagamento, conforme as opções da tela da consulta.",
      "Se algo não aparecer, peça ajuda a quem tem acesso a Faturamento (financeiro, admin ou proprietário).",
    ],
    keywords: ["valor", "preço", "cobrança", "esqueci"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "no-billing-menu",
    categoryId: "billing",
    question: "Por que não vejo o menu Faturamento?",
    answer: [
      "A listagem completa de cobranças é do financeiro e da gestão. Na recepção o caminho é agenda + quadro do dia.",
    ],
    keywords: ["faturamento", "menu", "não vejo"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },
  {
    id: "saas-not-my-job",
    categoryId: "billing",
    question: "Preciso cuidar do plano do sclinic?",
    answer: [
      "Não. A assinatura do sistema é do proprietário. Seu foco é a cobrança das consultas dos pacientes.",
    ],
    keywords: ["plano", "assinatura", "mensalidade"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  ...SHARED_ACCOUNT_FAQ,
]
