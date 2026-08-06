import { routes } from "@/config/routes"

/**
 * Owner post-SaaS-onboarding roadmap: missions that unlock scheduling,
 * plus the first appointment practice step.
 *
 * Progress is derived from domain data (no persisted checklist).
 */
export const OWNER_SETUP_MISSION_IDS = [
  "professional",
  "service",
  "patient",
  "appointment",
] as const

export type OwnerSetupMissionId = (typeof OWNER_SETUP_MISSION_IDS)[number]

export type OwnerSetupMissionDefinition = {
  id: OwnerSetupMissionId
  title: string
  description: string
  href: string
  ctaLabel: string
  /**
   * Unlock-scheduling prerequisites. Cannot be skipped.
   * The appointment mission is also required to dismiss the card,
   * but stays locked until all unlock missions are done.
   */
  unlocksScheduling: boolean
}

export const OWNER_SETUP_MISSIONS: readonly OwnerSetupMissionDefinition[] = [
  {
    id: "professional",
    title: "Quem vai atender?",
    description:
      "Adicione o médico, dentista ou outro profissional da clínica. Se for você quem atende, basta se cadastrar também.",
    href: routes.professionals,
    ctaLabel: "Adicionar quem atende",
    unlocksScheduling: true,
  },
  {
    id: "service",
    title: "O que a clínica oferece?",
    description:
      "Informe o que vocês fazem e quanto cobram — por exemplo, consulta ou retorno.",
    href: routes.settingsServices,
    ctaLabel: "Informar o que oferecem",
    unlocksScheduling: true,
  },
  {
    id: "patient",
    title: "Cadastre a primeira pessoa",
    description:
      "Coloque os dados de alguém que já vem ou vai vir à clínica.",
    href: routes.patients,
    ctaLabel: "Cadastrar pessoa",
    unlocksScheduling: true,
  },
  {
    id: "appointment",
    title: "Marque a primeira consulta",
    description:
      "Escolha dia e horário. É o jeito mais fácil de ver a agenda funcionando.",
    href: routes.appointments,
    ctaLabel: "Marcar consulta",
    unlocksScheduling: false,
  },
] as const

/** Wide range for “any appointment exists” checks on the setup roadmap. */
export const OWNER_SETUP_APPOINTMENT_COUNT_RANGE = {
  from: new Date("2000-01-01T00:00:00.000Z"),
  to: new Date("2100-01-01T00:00:00.000Z"),
} as const
