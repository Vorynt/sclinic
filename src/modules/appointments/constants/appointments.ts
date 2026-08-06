import type {
  AppointmentModality,
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

/** How the appointment is delivered (ADR-011). */
export const APPOINTMENT_MODALITY_LABELS: Record<AppointmentModality, string> =
  {
    in_person: "Presencial",
    online: "Online",
  };

/**
 * Statuses that still allow reschedule / edit details.
 * Terminal outcomes (completed, canceled, no_show) are read-only.
 */
export const APPOINTMENT_SCHEDULE_EDITABLE_STATUSES = [
  "scheduled",
  "confirmed",
  "checked_in",
] as const satisfies readonly AppointmentStatus[];

export function isAppointmentScheduleEditable(
  status: AppointmentStatus,
): boolean {
  return (
    APPOINTMENT_SCHEDULE_EDITABLE_STATUSES as readonly AppointmentStatus[]
  ).includes(status);
}

/** Confirm is only meaningful from the initial scheduled state. */
export function canConfirmAppointment(status: AppointmentStatus): boolean {
  return status === "scheduled";
}

/**
 * Eligibility for the reception bulk-confirm action (ADR-011 extension).
 * Self-schedule-only roles (doctor/nurse) may only confirm their own agenda.
 */
export function isAppointmentConfirmableInBatch(params: {
  status: AppointmentStatus;
  professionalId: string | null;
  ownProfessionalId: string | null;
}): boolean {
  if (!canConfirmAppointment(params.status)) return false;
  if (
    params.ownProfessionalId &&
    params.professionalId !== params.ownProfessionalId
  ) {
    return false;
  }
  return true;
}

/** No-show applies before the patient is checked in. */
export function canMarkAppointmentNoShow(status: AppointmentStatus): boolean {
  return status === "scheduled" || status === "confirmed";
}

/** Start attendance moves the appointment into checked_in. */
export function canStartAttendance(status: AppointmentStatus): boolean {
  return status === "scheduled" || status === "confirmed";
}

/** Resume opens the workspace when already in progress. */
export function canResumeAttendance(status: AppointmentStatus): boolean {
  return status === "checked_in";
}

/** Drawer / agenda can open the attendance workspace. */
export function canOpenAttendance(status: AppointmentStatus): boolean {
  return (
    canStartAttendance(status) ||
    canResumeAttendance(status) ||
    status === "completed"
  );
}

/** Complete finishes an in-progress attendance. */
export function canCompleteAttendance(status: AppointmentStatus): boolean {
  return status === "checked_in";
}

/**
 * Professional roles that may only view/schedule appointments for their own
 * profile. Other roles with appointment permissions see the full clinic agenda.
 */
export const SELF_SCHEDULE_ONLY_ROLE_KEYS = ["clinician", "nurse"] as const;

export function isSelfScheduleOnlyRole(
  roleKey: string | null | undefined,
): boolean {
  return (
    roleKey != null &&
    (SELF_SCHEDULE_ONLY_ROLE_KEYS as readonly string[]).includes(roleKey)
  );
}

/**
 * Roles allowed to start attendance (move appointment into checked_in).
 * Healthcare professionals plus clinic owner/admin.
 */
export const CAN_START_ATTENDANCE_ROLE_KEYS = [
  "owner",
  "admin",
  "clinician",
  "nurse",
] as const;

export function canRoleStartAttendance(
  roleKey: string | null | undefined,
): boolean {
  return (
    roleKey != null &&
    (CAN_START_ATTENDANCE_ROLE_KEYS as readonly string[]).includes(roleKey)
  );
}

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
