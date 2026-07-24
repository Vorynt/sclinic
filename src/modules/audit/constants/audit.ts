export const AUDIT_ACTIONS = {
  PATIENT_CREATE: "patient.create",
  PATIENT_UPDATE: "patient.update",
  PATIENT_DELETE: "patient.delete",
  APPOINTMENT_CREATE: "appointment.create",
  APPOINTMENT_RESCHEDULE: "appointment.reschedule",
  APPOINTMENT_UPDATE: "appointment.update",
  APPOINTMENT_STATUS_UPDATE: "appointment.status_update",
  APPOINTMENT_CANCEL: "appointment.cancel",
  CLINIC_CREATE: "clinic.create",
  CLINIC_UPDATE: "clinic.update",
  CLINIC_DELETE: "clinic.delete",
  CLINIC_HOURS_UPSERT: "clinic_hours.upsert",
  MEMBER_ROLE_UPDATE: "member.role_update",
  MEMBER_REMOVE: "member.remove",
  MEMBER_STATUS_UPDATE: "member.status_update",
  INVITATION_CREATE: "invitation.create",
  INVITATION_REVOKE: "invitation.revoke",
  INVITATION_ACCEPT: "invitation.accept",
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]

export const AUDIT_ENTITY_TYPES = {
  PATIENT: "patient",
  APPOINTMENT: "appointment",
  CLINIC: "clinic",
  CLINIC_HOURS: "clinic_hours",
  MEMBER: "member",
  INVITATION: "invitation",
} as const

export type AuditEntityType =
  (typeof AUDIT_ENTITY_TYPES)[keyof typeof AUDIT_ENTITY_TYPES]

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.PATIENT_CREATE]: "Paciente criado",
  [AUDIT_ACTIONS.PATIENT_UPDATE]: "Paciente atualizado",
  [AUDIT_ACTIONS.PATIENT_DELETE]: "Paciente excluído",
  [AUDIT_ACTIONS.APPOINTMENT_CREATE]: "Agendamento criado",
  [AUDIT_ACTIONS.APPOINTMENT_RESCHEDULE]: "Agendamento remarcado",
  [AUDIT_ACTIONS.APPOINTMENT_UPDATE]: "Agendamento atualizado",
  [AUDIT_ACTIONS.APPOINTMENT_STATUS_UPDATE]: "Status do agendamento alterado",
  [AUDIT_ACTIONS.APPOINTMENT_CANCEL]: "Agendamento cancelado",
  [AUDIT_ACTIONS.CLINIC_CREATE]: "Clínica criada",
  [AUDIT_ACTIONS.CLINIC_UPDATE]: "Clínica atualizada",
  [AUDIT_ACTIONS.CLINIC_DELETE]: "Clínica excluída",
  [AUDIT_ACTIONS.CLINIC_HOURS_UPSERT]: "Horários atualizados",
  [AUDIT_ACTIONS.MEMBER_ROLE_UPDATE]: "Papel do membro alterado",
  [AUDIT_ACTIONS.MEMBER_REMOVE]: "Membro removido",
  [AUDIT_ACTIONS.MEMBER_STATUS_UPDATE]: "Status do membro alterado",
  [AUDIT_ACTIONS.INVITATION_CREATE]: "Convite enviado",
  [AUDIT_ACTIONS.INVITATION_REVOKE]: "Convite cancelado",
  [AUDIT_ACTIONS.INVITATION_ACCEPT]: "Convite aceito",
}

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  [AUDIT_ENTITY_TYPES.PATIENT]: "Paciente",
  [AUDIT_ENTITY_TYPES.APPOINTMENT]: "Agendamento",
  [AUDIT_ENTITY_TYPES.CLINIC]: "Clínica",
  [AUDIT_ENTITY_TYPES.CLINIC_HOURS]: "Horários",
  [AUDIT_ENTITY_TYPES.MEMBER]: "Membro",
  [AUDIT_ENTITY_TYPES.INVITATION]: "Convite",
}
