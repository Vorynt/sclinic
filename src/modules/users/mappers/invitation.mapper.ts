import type {
  AssignableRole,
  ClinicInvitation,
  InvitationStatus,
} from "@/modules/users/types/invitation"

const INVITATION_STATUSES = new Set<InvitationStatus>([
  "pending",
  "accepted",
  "expired",
  "revoked",
  "resent",
])

function toInvitationStatus(value: unknown): InvitationStatus {
  if (
    typeof value === "string" &&
    INVITATION_STATUSES.has(value as InvitationStatus)
  ) {
    return value as InvitationStatus
  }
  return "pending"
}

export function toClinicInvitation(row: {
  id: string
  clinicId: string
  email: string
  roleId: string
  roleKey: string
  roleName: string
  invitedBy: string
  invitedByName: string | null
  professionalId: string | null
  status: unknown
  expiresAt: Date
  acceptedAt: Date | null
  createdAt: Date
}): ClinicInvitation {
  return {
    id: row.id,
    clinicId: row.clinicId,
    email: row.email,
    roleId: row.roleId,
    roleKey: row.roleKey,
    roleName: row.roleName,
    invitedBy: row.invitedBy,
    invitedByName: row.invitedByName,
    professionalId: row.professionalId,
    status: toInvitationStatus(row.status),
    expiresAt: row.expiresAt,
    acceptedAt: row.acceptedAt,
    createdAt: row.createdAt,
  }
}

export function toAssignableRole(row: {
  id: string
  key: string
  name: string
  description: string | null
}): AssignableRole {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
  }
}
