import type { PermissionKey } from "@/config/permissions";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";

export type SettingsNavItem = {
  title: string;
  href: string;
  description: string;
  /** Visual emphasis for destructive sections. */
  tone?: "default" | "danger";
  /** When set, nav item is shown only if the user has this permission. */
  permission?: PermissionKey;
  /** When true, item is shown only to the clinic owner. */
  requiresOwner?: boolean;
};

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
    title: "Receitas",
    href: routes.settingsPrescriptions,
    description: "Modelos de receita para impressão",
  },
  {
    title: "Uso do plano",
    href: routes.settingsUsage,
    description: "Limites e consumo de recursos do plano",
    requiresOwner: true,
  },
  {
    title: "Auditoria",
    href: routes.settingsAudit,
    description: "Histórico de ações na clínica",
    permission: Permission.AUDIT_READ,
  },
  {
    title: "Zona de perigo",
    href: routes.settingsDanger,
    description: "Exclusão da clínica e dados",
    tone: "danger",
  },
];
