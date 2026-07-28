import { routes } from "@/config/routes"
import type { HelpFaqItem } from "@/modules/help/types/help"

/** Como achar a ajuda — comum a todos os papéis. */
export const SHARED_WHERE_IS_HELP: HelpFaqItem = {
  id: "where-is-help",
  categoryId: "getting-started",
  question: "Como volto nesta ajuda depois?",
  answer: [
    "No menu à esquerda, no final, toque em Ajuda (ícone de interrogação).",
    "Você pode pesquisar pelo que precisa ou escolher um assunto acima.",
  ],
  keywords: ["ajuda", "encontrar", "menu", "voltar"],
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
      "Em Minha conta → Segurança. Se você entrou com uma senha temporária (por convite), o sistema pode pedir a troca na primeira vez.",
    ],
    keywords: ["senha", "trocar senha", "segurança", "password"],
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
