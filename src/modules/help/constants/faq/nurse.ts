import { routes } from "@/config/routes"
import {
  SHARED_ACCOUNT_FAQ,
  SHARED_APPOINTMENT_STATUSES,
  SHARED_WHERE_IS_HELP,
} from "@/modules/help/constants/faq/shared"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ para enfermeiro(a) — apoio clínico, agenda própria, prontuário; sem patients.write / cobrança.
 */
export const HELP_FAQ_NURSE: HelpFaqItem[] = [
  {
    id: "what-is-sclinic-nurse",
    categoryId: "getting-started",
    question: "Para que serve o sclinic no meu trabalho?",
    answer: [
      "Você acompanha a agenda, inicia e apoia atendimentos, registra sinais vitais, notas e receitas quando fizer parte do seu fluxo.",
      "Cadastro completo de pacientes e cobrança no caixa ficam com recepção e outros papéis. Equipe e configurações são da gestão.",
    ],
    keywords: ["enfermeiro", "enfermagem", "para que serve"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },
  {
    id: "nurse-first-steps",
    categoryId: "getting-started",
    question: "Acabei de entrar. Por onde começo?",
    answer: [
      "Veja a home: ela destaca quem já chegou e o restante da sua agenda. Depois abra Agendamentos ou a ficha do paciente conforme a fila.",
    ],
    steps: [
      "Abra o Início e veja a fila clínica do dia.",
      "Entre em Agendamentos para iniciar o próximo atendimento.",
      "Registre vitais e notas nas abas do atendimento.",
      "Conclua quando o cuidado daquele horário terminar.",
    ],
    keywords: ["começar", "primeiro dia", "fila"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  SHARED_WHERE_IS_HELP,
  {
    id: "arrived-patients",
    categoryId: "getting-started",
    question: "Como sei quem já chegou?",
    answer: [
      "Na home, o resumo da fila destaca quem já está no fluxo de atendimento. Use isso para priorizar vitais e apoio clínico.",
    ],
    keywords: ["chegou", "fila", "prioridade", "check-in"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  {
    id: "view-patients",
    categoryId: "patients",
    question: "Consigo ver a ficha do paciente?",
    answer: [
      "Sim. Em Pacientes você consulta dados e o histórico clínico (notas, vitais, receitas) conforme a permissão de leitura.",
      "Criar ou editar o cadastro completo (nome, CPF, etc.) é da recepção ou de quem tem permissão de escrita no cadastro.",
    ],
    keywords: ["paciente", "ficha", "consultar", "ler"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "patient-alerts",
    categoryId: "patients",
    question: "Onde vejo alertas e alergias?",
    answer: [
      "Na ficha do paciente. Confira antes de administrar ou registrar cuidados.",
    ],
    keywords: ["alerta", "alergia"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "cannot-create-patient",
    categoryId: "patients",
    question: "Por que não consigo cadastrar paciente?",
    answer: [
      "No seu papel o cadastro de novos pacientes fica com a recepção (ou gestão). Peça a eles para incluir a pessoa e depois você atende pela agenda.",
    ],
    keywords: ["cadastrar", "novo paciente", "bloqueado"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "my-schedule",
    categoryId: "appointments",
    question: "Como funciona a minha agenda?",
    answer: [
      "Você vê e atualiza os atendimentos em que você é o profissional. A recepção marca horários para a clínica inteira.",
    ],
    keywords: ["agenda", "meus horários", "self"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "create-appointment",
    categoryId: "appointments",
    question: "Posso marcar horário para mim?",
    answer: [
      "Sim, em Agendamentos, para atendimentos em que você é o profissional. Para encaixes gerais da clínica, a recepção costuma organizar.",
    ],
    keywords: ["agendar", "marcar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  SHARED_APPOINTMENT_STATUSES,
  {
    id: "start-attendance",
    categoryId: "appointments",
    question: "Como inicio o atendimento?",
    answer: [
      "Abra a consulta na agenda e inicie. O status vira Em atendimento e você acessa notas, vitais e receitas.",
    ],
    steps: [
      "Abra a consulta.",
      "Inicie o atendimento.",
      "Registre vitais e anotações.",
      "Conclua ao final.",
    ],
    keywords: ["iniciar", "atender", "em atendimento"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "finish-attendance",
    categoryId: "appointments",
    question: "Como concluo o horário?",
    answer: [
      "Na tela de atendimento, conclua a consulta. O pagamento, se houver, fica com a recepção ou o financeiro — você não precisa da tela de Faturamento.",
    ],
    keywords: ["concluir", "encerrar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "reschedule",
    categoryId: "appointments",
    question: "Como remarco um horário meu?",
    answer: [
      "Abra a consulta e altere enquanto ainda for permitido. Cancelamentos amplos ou exclusões da agenda geral são da recepção/gestão.",
    ],
    keywords: ["remarcar", "cancelar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  {
    id: "vitals",
    categoryId: "records",
    question: "Como registro sinais vitais?",
    answer: [
      "No atendimento, aba Vitais: pressão, peso, altura e demais campos. O IMC pode ser calculado sozinho.",
    ],
    keywords: ["vitais", "pressão", "peso", "IMC", "triagem"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "clinical-notes",
    categoryId: "records",
    question: "Posso escrever evolução / notas?",
    answer: [
      "Sim, na aba Notas do atendimento. Use modelos prontos se a clínica tiver. A nota fica na consulta e na ficha do paciente.",
    ],
    keywords: ["nota", "evolução", "prontuário"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "prescriptions",
    categoryId: "records",
    question: "Consigo emitir receita?",
    answer: [
      "Sim, na aba Receitas: rascunho, emitir e imprimir. O modelo visual (cabeçalho/rodapé) é definido pela gestão da clínica.",
    ],
    keywords: ["receita", "prescrição", "imprimir"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  {
    id: "no-billing",
    categoryId: "getting-started",
    question: "Por que não registro pagamento?",
    answer: [
      "Cobrança no balcão e Faturamento não fazem parte do seu papel. Foque no cuidado clínico; a recepção ou o financeiro recebem o paciente.",
    ],
    keywords: ["pagamento", "cobrar", "faturamento", "não vejo"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },
  {
    id: "no-team-settings",
    categoryId: "getting-started",
    question: "Por que não vejo Equipe ou Configurações?",
    answer: [
      "Esses menus são da gestão e do proprietário. Você usa Pacientes (consulta), Agenda e a ajuda.",
    ],
    keywords: ["menu", "equipe", "configurações"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  ...SHARED_ACCOUNT_FAQ,
]
