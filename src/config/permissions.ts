/**
 * Catalog of permission keys (must stay in sync with `src/db/seed/rbac.ts`).
 */
export const Permission = {
  PATIENTS_READ: "patients.read",
  PATIENTS_WRITE: "patients.write",
  APPOINTMENTS_CREATE: "appointments.create",
  APPOINTMENTS_UPDATE: "appointments.update",
  APPOINTMENTS_DELETE: "appointments.delete",
  PROFESSIONALS_MANAGE: "professionals.manage",
  FINANCIAL_VIEW: "financial.view",
  FINANCIAL_MANAGE: "financial.manage",
  /** Create/mark paid/cancel charges tied to appointments (not full billing list). */
  FINANCIAL_COLLECT: "financial.collect",
  SETTINGS_MANAGE: "settings.manage",
  MEMBERS_INVITE: "members.invite",
  RECORDS_READ: "records.read",
  RECORDS_WRITE: "records.write",
  AUDIT_READ: "audit.read",
} as const

export type PermissionKey = (typeof Permission)[keyof typeof Permission]

export const ALL_PERMISSIONS = Object.values(Permission)
