import { routes } from "@/config/routes"
import {
  SHARED_ACCOUNT_FAQ,
  SHARED_APPOINTMENT_STATUSES,
  SHARED_WHERE_IS_HELP,
} from "@/modules/help/constants/faq/shared"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ para médico(a) — agenda própria, prontuário, receita; self-schedule.
 */
export const HELP_FAQ_DOCTOR: HelpFaqItem[] = [
  {
    id: "what-is-sclinic-doctor",
    categoryId: "getting-started",
    question: "Para que serve o sclinic no meu atendimento?",
    answer: [
      "É onde você vê sua agenda, inicia consultas, registra evolução, sinais vitais e emite receitas para imprimir.",
      "Você também pode cadastrar pacientes e, se precisar, registrar um pagamento. Equipe, configurações e plano ficam com a gestão.",
    ],
    keywords: ["médico", "doutor", "atendimento", "para que serve"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },
  {
    id: "doctor-first-steps",
    categoryId: "getting-started",
    question: "Acabei de aceitar o convite. O que faço?",
    answer: [
      "Se pedirem, troque a senha temporária. Depois abra o Início ou Agendamentos para ver sua agenda do dia.",
      "Seus horários de atendimento você define em Início → Meus horários. Se não configurar, valem os da clínica. A recepção agenda só nos horários livres.",
    ],
    steps: [
      "Confira Minha conta → Segurança se a senha for temporária.",
      "Abra Início → Meus horários e ajuste sua grade, se precisar.",
      "Abra Início ou Agendamentos.",
      "Inicie o atendimento quando o paciente estiver pronto.",
      "Registre notas, vitais e receita antes de concluir.",
    ],
    keywords: ["convite", "primeiro acesso", "começar"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Agenda", href: routes.appointments },
      { label: "Segurança", href: routes.accountSecurity },
    ],
  },
  SHARED_WHERE_IS_HELP,

  {
    id: "create-patient",
    categoryId: "patients",
    question: "Posso cadastrar paciente?",
    answer: [
      "Sim. Em Pacientes você cadastra ou edita. O CPF é único por clínica.",
      "Na ficha você vê histórico, alertas e o que já foi registrado clinicamente.",
    ],
    keywords: ["paciente", "cadastrar", "ficha"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "patient-alerts",
    categoryId: "patients",
    question: "Onde vejo alergias e alertas?",
    answer: [
      "Na ficha do paciente. Alertas importantes ficam em destaque para o atendimento.",
    ],
    keywords: ["alerta", "alergia", "ficha"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "patient-history",
    categoryId: "patients",
    question: "Como vejo consultas e anotações antigas?",
    answer: [
      "Abra a ficha do paciente: há abas/seções de consultas, notas, vitais e receitas anteriores.",
    ],
    keywords: ["histórico", "notas antigas", "evolução"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "my-schedule",
    categoryId: "appointments",
    question: "Por que só vejo (ou só marco) a minha agenda?",
    answer: [
      "Como profissional clínico, o sistema prioriza os seus atendimentos: você agenda e atualiza consultas em que você é o profissional.",
      "A recepção e a gestão marcam para toda a clínica.",
    ],
    keywords: ["minha agenda", "só eu", "self", "profissional"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "create-appointment",
    categoryId: "appointments",
    question: "Como marco uma consulta para mim?",
    answer: [
      "Em Agendamentos, escolha horário e paciente. Você será o profissional do atendimento.",
      "Se quiser já informar o valor da consulta, pode — alguém com permissão registra o pagamento depois (ou você mesmo).",
    ],
    keywords: ["agendar", "marcar", "consulta"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  SHARED_APPOINTMENT_STATUSES,
  {
    id: "start-attendance",
    categoryId: "appointments",
    question: "Como inicio o atendimento?",
    answer: [
      "Na agenda (ou na lista do dia), abra a consulta e inicie o atendimento. O status passa para Em atendimento.",
      "Você é levado à tela de atendimento com abas de notas, vitais e receitas.",
    ],
    steps: [
      "Abra a consulta.",
      "Toque em iniciar atendimento.",
      "Registre o que for necessário nas abas.",
      "Conclua quando terminar.",
    ],
    keywords: ["iniciar", "começar", "atender", "em atendimento"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "finish-attendance",
    categoryId: "appointments",
    question: "Como encerro a consulta?",
    answer: [
      "Na tela de atendimento, conclua a consulta. O status vira Concluída.",
      "Se houver valor em aberto, a recepção (ou você) registra o pagamento depois — você não precisa cuidar do caixa para fechar o clínico.",
    ],
    keywords: ["concluir", "encerrar", "finalizar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "reschedule",
    categoryId: "appointments",
    question: "Consigo remarcar ou cancelar?",
    answer: [
      "Sim, nas suas consultas que ainda puderem ser alteradas. Cancelar definitivamente ou limpar a agenda da clínica em massa é mais da recepção/gestão.",
    ],
    keywords: ["remarcar", "cancelar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "cannot-delete-appointment",
    categoryId: "appointments",
    question: "Por que não consigo excluir um agendamento?",
    answer: [
      "Excluir da agenda é permissão da gestão/recepção. Você atualiza status (remarcar, cancelar fluxo clínico) nas suas consultas.",
    ],
    keywords: ["excluir", "apagar", "deletar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  {
    id: "clinical-notes",
    categoryId: "records",
    question: "Onde escrevo a evolução?",
    answer: [
      "No atendimento, aba Notas. Dá para usar modelos prontos para agilizar.",
      "A anotação fica ligada àquela consulta e aparece na ficha do paciente.",
    ],
    keywords: ["nota", "evolução", "SOAP", "prontuário"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "vitals",
    categoryId: "records",
    question: "Como registro pressão, peso e altura?",
    answer: [
      "Aba Vitais no atendimento. O IMC pode ser calculado automaticamente a partir de peso e altura.",
    ],
    keywords: ["vitais", "pressão", "peso", "IMC"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "prescriptions",
    categoryId: "records",
    question: "Como faço e imprimo a receita?",
    answer: [
      "Aba Receitas: crie o rascunho, revise, emita e use Imprimir (abre a versão para impressão).",
      "Cabeçalho e rodapé da clínica são configurados pela gestão em Configurações → Receitas.",
    ],
    steps: [
      "Abra Receitas no atendimento.",
      "Monte o rascunho e revise.",
      "Emita.",
      "Toque em Imprimir.",
    ],
    keywords: ["receita", "prescrição", "imprimir", "medicamento"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "prescription-draft",
    categoryId: "records",
    question: "Posso salvar receita sem emitir?",
    answer: [
      "Sim — o rascunho fica para você revisar. Só depois de emitir ela vale como receita oficial para impressão.",
    ],
    keywords: ["rascunho", "emitir", "receita"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  {
    id: "collect-payment",
    categoryId: "billing",
    question: "Posso registrar que o paciente pagou?",
    answer: [
      "Sim, se a cobrança estiver pendente: pela consulta você pode marcar como pago e escolher a forma.",
      "A listagem completa de Faturamento é mais do financeiro; no dia a dia o balcão também recebe.",
    ],
    keywords: ["pagamento", "cobrar", "PIX", "receber"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "no-team-settings",
    categoryId: "getting-started",
    question: "Por que não vejo Equipe ou Configurações?",
    answer: [
      "Esses menus são da gestão e do proprietário. Seu foco é pacientes, agenda e prontuário.",
    ],
    keywords: ["equipe", "configurações", "menu", "não vejo"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  ...SHARED_ACCOUNT_FAQ,
]
