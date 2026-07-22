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
  SETTINGS_MANAGE: "settings.manage",
  MEMBERS_INVITE: "members.invite",
  RECORDS_READ: "records.read",
  RECORDS_WRITE: "records.write",
} as const

export type PermissionKey = (typeof Permission)[keyof typeof Permission]

export const ALL_PERMISSIONS = Object.values(Permission)
