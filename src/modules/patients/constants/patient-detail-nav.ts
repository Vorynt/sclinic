import type { PermissionKey } from "@/config/permissions"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"

/**
 * Sections of the patient detail workspace.
 * Add module sections here as patient-facing features land.
 */
export type PatientDetailNavItem = {
  id: string
  title: string
  description: string
  href: string
  /** Exact match only (overview). Nested sections use prefix match. */
  match: "exact" | "prefix"
  /** When set, user needs at least one of these permissions. */
  permissions?: readonly PermissionKey[]
}

export function getPatientDetailNavItems(
  patientId: string,
): PatientDetailNavItem[] {
  const overviewHref = routes.patientDetail(patientId)

  return [
    {
      id: "overview",
      title: "Resumo",
      description: "Visão geral e alertas clínicos",
      href: overviewHref,
      match: "exact",
    },
    {
      id: "profile",
      title: "Cadastro",
      description: "Dados demográficos e contato",
      href: routes.patientDetailProfile(patientId),
      match: "prefix",
    },
    {
      id: "appointments",
      title: "Agendamentos",
      description: "Histórico de consultas",
      href: routes.patientDetailAppointments(patientId),
      match: "prefix",
      permissions: [
        Permission.APPOINTMENTS_CREATE,
        Permission.APPOINTMENTS_UPDATE,
        Permission.APPOINTMENTS_DELETE,
      ],
    },
    {
      id: "notes",
      title: "Anotações",
      description: "Evolução clínica",
      href: routes.patientDetailNotes(patientId),
      match: "prefix",
      permissions: [Permission.RECORDS_READ],
    },
    {
      id: "vitals",
      title: "Sinais vitais",
      description: "Medições e histórico",
      href: routes.patientDetailVitals(patientId),
      match: "prefix",
      permissions: [Permission.RECORDS_READ],
    },
    {
      id: "prescriptions",
      title: "Documentos",
      description: "Receitas e declarações",
      href: routes.patientDetailDocuments(patientId),
      match: "prefix",
      permissions: [Permission.RECORDS_READ],
    },
  ]
}
