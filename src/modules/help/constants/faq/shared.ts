import { routes } from "@/config/routes"
import type { HelpFaqItem } from "@/modules/help/types/help"

/** Como achar a ajuda — comum a todos os papéis. */
export const SHARED_WHERE_IS_HELP: HelpFaqItem = {
  id: "where-is-help",
  categoryId: "getting-started",
  question: "Como volto nesta ajuda depois?",
  answer: [
    "No computador, abra Mais no topo e toque em Ajuda (ícone de interrogação). No celular, o mesmo atalho fica em Mais, na barra de baixo.",
    "Você pode pesquisar pelo que precisa, escolher um assunto ou ver de novo o tour do sistema.",
  ],
  keywords: ["ajuda", "encontrar", "menu", "voltar", "mais"],
  relatedRoutes: [{ label: "Abrir ajuda", href: routes.help }],
}

export const SHARED_PRODUCT_TOUR: HelpFaqItem = {
  id: "product-tour",
  categoryId: "getting-started",
  question: "Como vejo o tour das telas de novo?",
  answer: [
    "No primeiro acesso, o sclinic oferece um tour rápido mostrando onde ficam as telas na barra de navegação. Você pode ver ou pular.",
    "Para ver de novo, toque em Ver tour do sistema no topo desta ajuda.",
  ],
  keywords: ["tour", "tutorial", "guia", "primeiro acesso", "onde fica"],
  relatedRoutes: [{ label: "Abrir ajuda", href: routes.help }],
}

/** Conta pessoal — comum a todos os papéis. */
export const SHARED_ACCOUNT_FAQ: HelpFaqItem[] = [
  {
    id: "update-profile",
    categoryId: "account",
    question: "Como mudo meu nome ou meus dados?",
    answer: [
      "Em Minha conta → Dados pessoais. Isso altera o seu perfil de usuário — não os dados da clínica.",
    ],
    keywords: ["meu nome", "perfil", "dados pessoais", "conta"],
    relatedRoutes: [
      { label: "Dados pessoais", href: routes.accountProfile },
      { label: "Minha conta", href: routes.accountOverview },
    ],
  },
  {
    id: "change-password",
    categoryId: "account",
    question: "Como troco a senha?",
    answer: [
      "Em Minha conta → Segurança, toque em Alterar senha. Informe a senha atual e a nova.",
      "Você pode marcar para encerrar o acesso nos outros dispositivos. Se entrou com uma senha temporária (por convite), o sistema pode pedir a troca na primeira vez.",
    ],
    keywords: ["senha", "trocar senha", "segurança", "password"],
    relatedRoutes: [{ label: "Segurança", href: routes.accountSecurity }],
  },
  {
    id: "two-factor",
    categoryId: "account",
    question: "Como ativo a autenticação em duas etapas?",
    answer: [
      "Em Minha conta → Segurança. Confirme a senha; no modal, escaneie o QR no app autenticador e guarde os códigos de backup.",
      "No próximo login o sistema pedirá o código do app. Se perder o celular, use um código de backup.",
    ],
    keywords: ["2fa", "duas etapas", "autenticador", "totp", "backup"],
    relatedRoutes: [{ label: "Segurança", href: routes.accountSecurity }],
  },
  {
    id: "revoke-sessions",
    categoryId: "account",
    question: "Como encerro o acesso em outro dispositivo?",
    answer: [
      "Em Minha conta → Segurança, na lista de sessões ativas. Você pode encerrar uma sessão específica ou todas as outras. A sessão deste dispositivo não pode ser encerrada por aí — use Sair.",
    ],
    keywords: ["sessão", "dispositivo", "encerrar", "sair de outros"],
    relatedRoutes: [{ label: "Segurança", href: routes.accountSecurity }],
  },
  {
    id: "switch-clinic",
    categoryId: "account",
    question: "Trabalho em mais de uma clínica. Como troco?",
    answer: [
      "No topo da tela aparece a clínica atual. Toque nela para escolher outra da qual você faz parte.",
      "Cada clínica tem pacientes e agenda próprios — os dados não se misturam.",
    ],
    keywords: ["trocar", "outra clínica", "selecionar clínica"],
    relatedRoutes: [{ label: "Escolher clínica", href: routes.selectClinic }],
  },
]

export const SHARED_APPOINTMENT_STATUSES: HelpFaqItem = {
  id: "appointment-statuses",
  categoryId: "appointments",
  question: "O que significam os status da consulta?",
  answer: [
    "Eles mostram em que etapa a consulta está. O caminho mais comum é: Agendada → Confirmada → Em atendimento → Concluída.",
    "Também existem Cancelada (não vai acontecer) e Faltou (o paciente não apareceu).",
  ],
  keywords: [
    "status",
    "agendada",
    "confirmada",
    "em atendimento",
    "concluída",
    "faltou",
    "cancelada",
  ],
  relatedRoutes: [
    { label: "Agenda", href: routes.appointments },
    { label: "Início", href: routes.home },
  ],
}
