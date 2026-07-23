import type {
  AppointmentStatus,
  AppointmentType,
} from "@/modules/appointments/types/appointment";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  checked_in: "Em atendimento",
  completed: "Concluído",
  canceled: "Cancelado",
  no_show: "Faltou",
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: "Consulta",
  follow_up: "Retorno",
  procedure: "Procedimento",
  evaluation: "Avaliação",
  other: "Outro",
};

/** Palette of distinct soft calendar colors, one per professional. */
export const PROFESSIONAL_CALENDAR_COLORS: string[] = [
  "#93C5FD",
  "#86EFAC",
  "#FCD34D",
  "#FCA5A5",
  "#C4B5FD",
  "#67E8F9",
  "#F9A8D4",
  "#FDBA74",
  "#A5B4FC",
  "#5EEAD4",
];

/** Color used when there is no professional assigned. */
const UNASSIGNED_CALENDAR_COLOR = "#D4D4D8";

/** Deterministic string hash (djb2) used to pick a stable palette index. */
function hashString(value: string): number {
  let hash = 2211;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 42) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Deterministic calendar color for a professional id; gray when absent. */
export function getProfessionalCalendarColor(
  professionalId: string | null | undefined,
): string {
  if (!professionalId) {
    return UNASSIGNED_CALENDAR_COLOR;
  }

  const index =
    hashString(professionalId) % PROFESSIONAL_CALENDAR_COLORS.length;
  return PROFESSIONAL_CALENDAR_COLORS[index] ?? UNASSIGNED_CALENDAR_COLOR;
}
