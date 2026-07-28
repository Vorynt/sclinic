import type { HelpCategory } from "@/modules/help/types/help"

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    label: "Começar",
    description: "Como dar os primeiros passos na clínica.",
  },
  {
    id: "clinic",
    label: "Minha clínica",
    description: "Nome, horários e ajustes do dia a dia.",
  },
  {
    id: "team",
    label: "Minha equipe",
    description: "Convidar pessoas e organizar quem faz o quê.",
  },
  {
    id: "patients",
    label: "Pacientes",
    description: "Cadastrar e acompanhar quem você atende.",
  },
  {
    id: "appointments",
    label: "Agenda",
    description: "Marcar consultas e atender pacientes.",
  },
  {
    id: "records",
    label: "Prontuário",
    description: "Anotações, sinais vitais e receitas.",
  },
  {
    id: "billing",
    label: "Recebimentos",
    description: "Cobrar consultas e registrar pagamentos.",
  },
  {
    id: "subscription",
    label: "Meu plano",
    description: "Assinatura do sclinic e limites do plano.",
  },
  {
    id: "account",
    label: "Minha conta",
    description: "Seus dados pessoais e senha.",
  },
]

export const HELP_CATEGORY_IDS = HELP_CATEGORIES.map((c) => c.id)
