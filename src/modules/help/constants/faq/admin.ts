import { routes } from "@/config/routes"
import {
  SHARED_ACCOUNT_FAQ,
  SHARED_APPOINTMENT_STATUSES,
  SHARED_WHERE_IS_HELP,
} from "@/modules/help/constants/faq/shared"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ para administrador da clínica — operação completa, sem plano SaaS / zona de perigo.
 */
export const HELP_FAQ_ADMIN: HelpFaqItem[] = [
  {
    id: "what-is-sclinic-admin",
    categoryId: "getting-started",
    question: "Para que serve o sclinic no meu dia a dia?",
    answer: [
      "É o sistema da clínica: agenda, pacientes, equipe, atendimento e recebimentos.",
      "Como administrador, você cuida da operação — convidar pessoas, ajustar configurações e acompanhar o fluxo do dia. O plano e a exclusão da clínica ficam com o proprietário.",
    ],
    keywords: ["sclinic", "administrador", "admin", "para que serve"],
    relatedRoutes: [{ label: "Ir para o início", href: routes.home }],
  },
  {
    id: "admin-first-steps",
    categoryId: "getting-started",
    question: "Acabei de entrar. Por onde começo?",
    answer: [
      "Veja a home para o resumo do dia. Depois confira se a equipe e os profissionais estão cadastrados e se a agenda do dia está organizada.",
    ],
    steps: [
      "Abra o Início e veja os números do dia.",
      "Em Equipe e Profissionais, confira quem já está ativo.",
      "Em Pacientes e Agendamentos, cadastre ou ajuste o que faltar.",
      "Se precisar mudar nome ou horários da clínica, use Configurações.",
    ],
    keywords: ["começar", "primeiro dia", "o que fazer"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Equipe", href: routes.users },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  SHARED_WHERE_IS_HELP,

  {
    id: "edit-clinic-data",
    categoryId: "clinic",
    question: "Como altero os dados da clínica?",
    answer: [
      "Em Configurações → Geral você muda nome e demais dados. Isso aparece no sistema e em documentos como a receita.",
    ],
    steps: [
      "Abra Configurações → Geral.",
      "Altere o que precisar e salve.",
    ],
    keywords: ["nome", "clínica", "configurações", "editar"],
    relatedRoutes: [
      { label: "Configurações gerais", href: routes.settingsGeneral },
    ],
  },
  {
    id: "clinic-hours",
    categoryId: "clinic",
    question: "Como defino os horários de funcionamento?",
    answer: [
      "Em Configurações → Horários. A agenda usa isso para saber quando é possível marcar consulta.",
    ],
    keywords: ["horários", "funcionamento", "agenda"],
    relatedRoutes: [
      { label: "Horários", href: routes.settingsHours },
    ],
  },
  {
    id: "prescription-templates",
    categoryId: "clinic",
    question: "Como personalizo o visual da receita?",
    answer: [
      "Em Configurações → Receitas você ajusta textos de cabeçalho e rodapé usados na impressão.",
    ],
    keywords: ["receita", "modelo", "cabeçalho", "imprimir"],
    relatedRoutes: [
      { label: "Modelos de receita", href: routes.settingsPrescriptions },
    ],
  },
  {
    id: "audit-logs",
    categoryId: "clinic",
    question: "Onde vejo o histórico de ações da clínica?",
    answer: [
      "Em Configurações → Auditoria ficam registros importantes do que aconteceu na clínica.",
    ],
    keywords: ["auditoria", "histórico", "quem fez"],
    relatedRoutes: [{ label: "Auditoria", href: routes.settingsAudit }],
  },
  {
    id: "cannot-delete-clinic",
    categoryId: "clinic",
    question: "Consigo apagar a clínica?",
    answer: [
      "Não. Só o proprietário pode usar a Zona de perigo para apagar a clínica.",
      "Se precisar disso, fale com o dono da conta.",
    ],
    keywords: ["apagar", "excluir clínica", "zona de perigo"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  {
    id: "invite-team",
    categoryId: "team",
    question: "Como convido alguém da equipe?",
    answer: [
      "Em Equipe você envia um convite por e-mail e escolhe a função (recepção, gestão, financeiro, etc.).",
      "A pessoa recebe o link, entra e passa a aparecer na clínica.",
    ],
    steps: [
      "Abra Equipe.",
      "Convide, escolha a função e informe o e-mail.",
      "Acompanhe convites pendentes na mesma tela.",
    ],
    keywords: ["convidar", "equipe", "recepção", "colaborador"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },
  {
    id: "invite-professional",
    categoryId: "team",
    question: "Como cadastro um médico ou enfermeiro?",
    answer: [
      "Em Profissionais. A pessoa completa o cadastro (incluindo o número do conselho) e fica pronta para atender.",
      "O plano da clínica tem limite de profissionais — se o convite for bloqueado, o proprietário precisa ver Uso do plano.",
    ],
    keywords: ["médico", "enfermeiro", "profissional", "CRM"],
    relatedRoutes: [
      { label: "Profissionais", href: routes.professionals },
    ],
  },
  {
    id: "roles-permissions",
    categoryId: "team",
    question: "Qual a diferença entre as funções?",
    answer: [
      "Cada função vê menus diferentes.",
      "Em resumo: você (admin) opera quase tudo; o gestor acompanha a operação; a recepção agenda e cobra no balcão; o financeiro cuida das cobranças; médicos e enfermeiros atendem e usam o prontuário. O proprietário cuida do plano e pode apagar a clínica.",
    ],
    keywords: ["função", "papel", "permissão", "diferença"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },
  {
    id: "suspend-member",
    categoryId: "team",
    question: "Como tiro o acesso de alguém?",
    answer: [
      "Na tela de Equipe você pode suspender ou remover. Suspenso não entra; removido some da listagem ativa.",
      "Não dá para remover o proprietário por esse caminho.",
    ],
    keywords: ["suspender", "remover", "tirar acesso"],
    relatedRoutes: [{ label: "Equipe", href: routes.users }],
  },

  {
    id: "create-patient",
    categoryId: "patients",
    question: "Como cadastro um paciente?",
    answer: [
      "Abra Pacientes e cadastre. O CPF não pode se repetir na mesma clínica.",
      "Na ficha você vê dados, histórico de consultas e anotações clínicas (se tiver permissão).",
    ],
    steps: [
      "Abra Pacientes → cadastrar.",
      "Preencha e salve.",
      "Use a busca para achar depois.",
    ],
    keywords: ["paciente", "cadastrar", "CPF"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "archive-patient",
    categoryId: "patients",
    question: "Como removo um paciente da lista?",
    answer: [
      "Arquive o paciente. Ele some da lista do dia a dia, mas o histórico fica na clínica.",
    ],
    keywords: ["arquivar", "remover paciente"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "patient-alerts",
    categoryId: "patients",
    question: "Como registro alergia ou alerta na ficha?",
    answer: [
      "Na ficha do paciente você adiciona alertas (por exemplo, alergia). Eles ficam em destaque no atendimento.",
    ],
    keywords: ["alerta", "alergia"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "create-appointment",
    categoryId: "appointments",
    question: "Como marco uma consulta?",
    answer: [
      "Em Agendamentos, escolha dia e horário. Informe paciente, profissional e tipo. Se quiser, já coloque o valor para cobrar depois.",
    ],
    steps: [
      "Abra Agendamentos.",
      "Escolha data e horário.",
      "Preencha paciente, profissional e detalhes.",
      "Salve — começa como Agendada.",
    ],
    keywords: ["marcar", "agendar", "consulta"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  SHARED_APPOINTMENT_STATUSES,
  {
    id: "start-attendance",
    categoryId: "appointments",
    question: "Como começo ou acompanho um atendimento?",
    answer: [
      "Na agenda, abra a consulta e inicie o atendimento (status Em atendimento).",
      "Aí dá para registrar notas, vitais e receitas. A recepção não inicia o atendimento clínico — quem atende é o profissional (ou você, se for o caso).",
    ],
    keywords: ["iniciar atendimento", "atender"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "reschedule-cancel",
    categoryId: "appointments",
    question: "Como remarco ou cancelo?",
    answer: [
      "Abra a consulta na agenda. Enquanto puder ser alterada, mude o horário ou cancele.",
      "Concluídas, canceladas ou com falta não podem ser remarcadas.",
    ],
    keywords: ["remarcar", "cancelar", "reagendar"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },

  {
    id: "clinical-notes",
    categoryId: "records",
    question: "Onde fica a evolução do paciente?",
    answer: [
      "Durante o atendimento, na aba Notas. Também aparece depois na ficha do paciente.",
    ],
    keywords: ["nota", "evolução", "prontuário"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "vitals-alerts",
    categoryId: "records",
    question: "Como registro pressão, peso e vitais?",
    answer: [
      "No atendimento, aba Vitais. O IMC pode ser calculado automaticamente.",
    ],
    keywords: ["vitais", "pressão", "peso", "IMC"],
    relatedRoutes: [{ label: "Agenda", href: routes.appointments }],
  },
  {
    id: "prescriptions",
    categoryId: "records",
    question: "Como emitir e imprimir receita?",
    answer: [
      "No atendimento, abra Receitas: rascunho → emitir → Imprimir.",
      "O visual (cabeçalho/rodapé) fica em Configurações → Receitas.",
    ],
    keywords: ["receita", "imprimir", "prescrição"],
    relatedRoutes: [
      { label: "Agenda", href: routes.appointments },
      { label: "Modelos de receita", href: routes.settingsPrescriptions },
    ],
  },

  {
    id: "how-charges-work",
    categoryId: "billing",
    question: "Como funciona a cobrança da consulta?",
    answer: [
      "Cada consulta pode ter um valor. Informe ao marcar ou registre o pagamento depois.",
      "Em Faturamento você vê pendentes, pagos e pode cancelar cobranças se precisar.",
    ],
    keywords: ["cobrança", "pagamento", "valor"],
    relatedRoutes: [
      { label: "Faturamento", href: routes.billing },
      { label: "Agenda", href: routes.appointments },
    ],
  },
  {
    id: "mark-charge-paid",
    categoryId: "billing",
    question: "O paciente pagou. Como registro?",
    answer: [
      "Em Faturamento, encontre a cobrança e marque como paga (PIX, dinheiro, cartão no balcão, etc.).",
      "Quem tem permissão na recepção também registra pela agenda ou pelo quadro do dia.",
    ],
    keywords: ["pago", "PIX", "dinheiro", "receber"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "saas-vs-clinical-billing",
    categoryId: "billing",
    question: "Faturamento e o plano do sclinic são a mesma coisa?",
    answer: [
      "Não. Faturamento é o dinheiro das consultas dos pacientes.",
      "O plano (assinatura) é o que o proprietário paga para usar o sclinic — só ele gerencia em Minha conta → Assinatura.",
    ],
    keywords: ["assinatura", "plano", "diferença", "mensalidade"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },

  ...SHARED_ACCOUNT_FAQ,
]
