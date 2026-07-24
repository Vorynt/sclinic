import { routes } from "@/config/routes"

export type SettingsNavItem = {
  title: string
  href: string
  description: string
  /** Visual emphasis for destructive sections. */
  tone?: "default" | "danger"
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    title: "Geral",
    href: routes.settingsGeneral,
    description: "Dados básicos e fuso horário da clínica",
  },
  {
    title: "Horários",
    href: routes.settingsHours,
    description: "Funcionamento semanal da clínica",
  },
  {
    title: "Zona de perigo",
    href: routes.settingsDanger,
    description: "Exclusão da clínica e dados",
    tone: "danger",
  },
]
