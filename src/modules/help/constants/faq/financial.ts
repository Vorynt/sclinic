import { routes } from "@/config/routes"
import {
  SHARED_ACCOUNT_FAQ,
  SHARED_WHERE_IS_HELP,
} from "@/modules/help/constants/faq/shared"
import type { HelpFaqItem } from "@/modules/help/types/help"

/**
 * FAQ para financeiro — cobranças clínicas; pacientes só leitura; sem agenda.
 */
export const HELP_FAQ_FINANCIAL: HelpFaqItem[] = [
  {
    id: "what-is-sclinic-financial",
    categoryId: "getting-started",
    question: "Para que serve o sclinic no financeiro?",
    answer: [
      "É onde você acompanha as cobranças das consultas: o que está pendente, o que já foi pago e o resumo do mês.",
      "Você não marca consulta nem edita prontuário — o foco é o dinheiro das consultas dos pacientes (não a mensalidade do sclinic).",
    ],
    keywords: ["financeiro", "cobrança", "para que serve"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Faturamento", href: routes.billing },
    ],
  },
  {
    id: "financial-first-steps",
    categoryId: "getting-started",
    question: "Por onde começo no dia a dia?",
    answer: [
      "Na home você vê o resumo (a receber × recebido no mês) e uma prévia de pendências. Em Faturamento está a lista completa.",
    ],
    steps: [
      "Abra o Início e confira os totais.",
      "Veja as cobranças pendentes na prévia ou em Faturamento.",
      "Marque como pago quando o paciente quitar.",
      "Se precisar do contexto do paciente, abra Pacientes (somente consulta).",
    ],
    keywords: ["começar", "rotina", "resumo"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Faturamento", href: routes.billing },
    ],
  },
  SHARED_WHERE_IS_HELP,

  {
    id: "view-patients",
    categoryId: "patients",
    question: "Por que vejo Pacientes?",
    answer: [
      "Para consultar quem é a pessoa ligada à cobrança (nome, contato). Você não cadastra nem arquiva pacientes neste papel.",
    ],
    keywords: ["pacientes", "consultar", "só leitura"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },
  {
    id: "cannot-edit-patient",
    categoryId: "patients",
    question: "Consigo alterar o cadastro do paciente?",
    answer: [
      "Não. Peça à recepção ou à gestão para corrigir dados cadastrais.",
    ],
    keywords: ["editar", "cadastrar", "bloqueado"],
    relatedRoutes: [{ label: "Pacientes", href: routes.patients }],
  },

  {
    id: "how-charges-work",
    categoryId: "billing",
    question: "De onde vem uma cobrança?",
    answer: [
      "Em geral, ao marcar a consulta alguém informa o valor — isso gera uma cobrança ligada àquele atendimento.",
      "Quando a consulta é concluída e ainda não pagou, fica pendente para você (ou a recepção) receber.",
    ],
    keywords: ["origem", "como nasce", "consulta", "valor"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "billing-list",
    categoryId: "billing",
    question: "Como uso a tela de Faturamento?",
    answer: [
      "A lista mostra cobranças com status (pendente, paga, cancelada). Filtre e busque para achar o paciente ou o período.",
      "Abra o item para marcar pagamento, cancelar ou ver detalhes.",
    ],
    keywords: ["lista", "faturamento", "filtro", "status"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "mark-charge-paid",
    categoryId: "billing",
    question: "Como registro um pagamento?",
    answer: [
      "Abra a cobrança pendente e marque como paga, escolhendo a forma (PIX, dinheiro, cartão no balcão, transferência, etc.).",
    ],
    steps: [
      "Abra Faturamento (ou a pendência na home).",
      "Encontre a cobrança em aberto.",
      "Marque como paga e escolha a forma.",
      "Confirme — o total “recebido no mês” atualiza.",
    ],
    keywords: ["pago", "receber", "PIX", "dinheiro", "cartão"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "cancel-charge",
    categoryId: "billing",
    question: "Como cancelo uma cobrança errada?",
    answer: [
      "Na cobrança, use a opção de cancelar quando o valor foi criado por engano ou a consulta não vai gerar recebimento.",
      "Revise com cuidado cobranças já pagas antes de qualquer alteração.",
    ],
    keywords: ["cancelar", "erro", "estornar", "errado"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "pending-vs-paid",
    categoryId: "billing",
    question: "O que é “a receber” na home?",
    answer: [
      "É a soma das cobranças ainda pendentes. “Recebido no mês” soma o que foi marcado como pago no mês corrente.",
    ],
    keywords: ["a receber", "resumo", "mês", "kpi"],
    relatedRoutes: [
      { label: "Início", href: routes.home },
      { label: "Faturamento", href: routes.billing },
    ],
  },
  {
    id: "reception-also-collects",
    categoryId: "billing",
    question: "A recepção também pode receber?",
    answer: [
      "Sim. Quem tem permissão de cobrar no balcão registra pagamento pela agenda ou pelo quadro do dia.",
      "Você continua sendo o lugar certo para a visão completa e o acerto do que ficou pendente.",
    ],
    keywords: ["recepção", "balcão", "também cobra"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "saas-vs-clinical",
    categoryId: "billing",
    question: "Isso é a mensalidade do sclinic?",
    answer: [
      "Não. Tudo em Faturamento é cobrança clínica (paciente → clínica).",
      "A assinatura do software é do proprietário, em Minha conta → Assinatura — você não gerencia o plano da clínica.",
    ],
    keywords: ["plano", "assinatura", "SaaS", "mensalidade", "diferença"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "no-appointments-menu",
    categoryId: "getting-started",
    question: "Por que não vejo Agendamentos?",
    answer: [
      "Marcar e gerenciar a agenda não faz parte do papel financeiro. Se precisar do horário de uma consulta, peça à recepção ou use o vínculo na cobrança/paciente.",
    ],
    keywords: ["agenda", "agendamentos", "não vejo", "menu"],
    relatedRoutes: [{ label: "Faturamento", href: routes.billing }],
  },
  {
    id: "no-settings",
    categoryId: "getting-started",
    question: "Consigo mudar dados da clínica?",
    answer: [
      "Não. Configurações e equipe são da gestão/proprietário. Sua área é Faturamento e consulta a Pacientes.",
    ],
    keywords: ["configurações", "equipe", "permissão"],
    relatedRoutes: [{ label: "Início", href: routes.home }],
  },

  ...SHARED_ACCOUNT_FAQ,
]
