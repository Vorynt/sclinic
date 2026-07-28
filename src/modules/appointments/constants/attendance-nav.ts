import { routes } from "@/config/routes"

/**
 * Sections of the attendance workspace.
 * Add module sections here as clinical features land (notes, documents, etc.).
 */
export type AttendanceNavItem = {
  id: string
  title: string
  description: string
  href: string
  /** Exact match only (overview). Nested sections use prefix match. */
  match: "exact" | "prefix"
}

export function getAttendanceNavItems(
  appointmentId: string,
): AttendanceNavItem[] {
  const overviewHref = routes.appointmentAttendance(appointmentId)

  return [
    {
      id: "overview",
      title: "Resumo",
      description: "Contexto do agendamento e do paciente",
      href: overviewHref,
      match: "exact",
    },
    {
      id: "notes",
      title: "Anotações",
      description: "Evolução clínica e histórico",
      href: routes.appointmentAttendanceNotes(appointmentId),
      match: "prefix",
    },
    {
      id: "vitals",
      title: "Sinais vitais",
      description: "Medições e histórico do paciente",
      href: routes.appointmentAttendanceVitals(appointmentId),
      match: "prefix",
    },
    {
      id: "prescriptions",
      title: "Receitas",
      description: "Prescrição e impressão",
      href: routes.appointmentAttendancePrescriptions(appointmentId),
      match: "prefix",
    },
  ]
}
