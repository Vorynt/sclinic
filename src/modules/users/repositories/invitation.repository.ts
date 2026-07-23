import { and, desc, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { invitations, roles, user } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toClinicInvitation } from "@/modules/users/mappers/invitation.mapper"
import type { ClinicInvitation } from "@/modules/users/types/invitation"

const invitationSelect = {
  id: invitations.id,
  clinicId: invitations.clinicId,
  email: invitations.email,
  roleId: invitations.roleId,
  roleKey: roles.key,
  roleName: roles.name,
  invitedBy: invitations.invitedBy,
  invitedByName: user.name,
  professionalId: invitations.professionalId,
  status: invitations.status,
  expiresAt: invitations.expiresAt,
  acceptedAt: invitations.acceptedAt,
  createdAt: invitations.createdAt,
}

const OPEN_INVITE_STATUSES = ["pending", "resent"] as const

export const invitationRepository = {
  async listPendingByClinic(clinicId: string): Promise<ClinicInvitation[]> {
    return withDbError(async () => {
      const rows = await db
        .select(invitationSelect)
        .from(invitations)
        .innerJoin(roles, eq(roles.id, invitations.roleId))
        .innerJoin(user, eq(user.id, invitations.invitedBy))
        .where(
          and(
            eq(invitations.clinicId, clinicId),
            eq(invitations.status, "pending"),
            isNull(invitations.professionalId),
          ),
        )

      return rows.map(toClinicInvitation)
    })
  },

  async findById(
    invitationId: string,
    clinicId: string,
  ): Promise<ClinicInvitation | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(invitationSelect)
        .from(invitations)
        .innerJoin(roles, eq(roles.id, invitations.roleId))
        .innerJoin(user, eq(user.id, invitations.invitedBy))
        .where(
          and(
            eq(invitations.id, invitationId),
            eq(invitations.clinicId, clinicId),
          ),
        )
        .limit(1)

      return row ? toClinicInvitation(row) : null
    })
  },

  async findPendingByEmailAndClinic(
    email: string,
    clinicId: string,
  ): Promise<ClinicInvitation | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(invitationSelect)
        .from(invitations)
        .innerJoin(roles, eq(roles.id, invitations.roleId))
        .innerJoin(user, eq(user.id, invitations.invitedBy))
        .where(
          and(
            eq(invitations.email, email.toLowerCase()),
            eq(invitations.clinicId, clinicId),
            eq(invitations.status, "pending"),
          ),
        )
        .limit(1)

      return row ? toClinicInvitation(row) : null
    })
  },

  async findPendingByProfessionalId(
    professionalId: string,
    clinicId: string,
  ): Promise<ClinicInvitation | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(invitationSelect)
        .from(invitations)
        .innerJoin(roles, eq(roles.id, invitations.roleId))
        .innerJoin(user, eq(user.id, invitations.invitedBy))
        .where(
          and(
            eq(invitations.professionalId, professionalId),
            eq(invitations.clinicId, clinicId),
            inArray(invitations.status, [...OPEN_INVITE_STATUSES]),
          ),
        )
        .orderBy(desc(invitations.createdAt))
        .limit(1)

      return row ? toClinicInvitation(row) : null
    })
  },

  async findByTokenHash(tokenHash: string): Promise<ClinicInvitation | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(invitationSelect)
        .from(invitations)
        .innerJoin(roles, eq(roles.id, invitations.roleId))
        .innerJoin(user, eq(user.id, invitations.invitedBy))
        .where(eq(invitations.tokenHash, tokenHash))
        .limit(1)

      return row ? toClinicInvitation(row) : null
    })
  },

  async create(params: {
    clinicId: string
    email: string
    roleId: string
    invitedBy: string
    tokenHash: string
    expiresAt: Date
    professionalId?: string
  }): Promise<ClinicInvitation> {
    return withDbError(async () => {
      const [row] = await db
        .insert(invitations)
        .values({
          clinicId: params.clinicId,
          email: params.email.toLowerCase(),
          roleId: params.roleId,
          invitedBy: params.invitedBy,
          tokenHash: params.tokenHash,
          expiresAt: params.expiresAt,
          professionalId: params.professionalId ?? null,
          status: "pending",
        })
        .returning({ id: invitations.id })

      if (!row) {
        throw new Error("Failed to create invitation")
      }

      const created = await invitationRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!created) {
        throw new Error("Failed to load invitation after create")
      }
      return created
    })
  },

  async revoke(invitationId: string, clinicId: string): Promise<void> {
    return withDbError(async () => {
      await db
        .update(invitations)
        .set({ status: "revoked" })
        .where(
          and(
            eq(invitations.id, invitationId),
            eq(invitations.clinicId, clinicId),
            inArray(invitations.status, ["pending", "resent"]),
          ),
        )
    })
  },

  async revokePendingByProfessionalId(
    professionalId: string,
    clinicId: string,
  ): Promise<void> {
    return withDbError(async () => {
      await db
        .update(invitations)
        .set({ status: "revoked" })
        .where(
          and(
            eq(invitations.professionalId, professionalId),
            eq(invitations.clinicId, clinicId),
            inArray(invitations.status, ["pending", "resent"]),
          ),
        )
    })
  },

  async markAccepted(invitationId: string): Promise<void> {
    return withDbError(async () => {
      await db
        .update(invitations)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
        })
        .where(
          and(
            eq(invitations.id, invitationId),
            eq(invitations.status, "pending"),
          ),
        )
    })
  },

  async markExpired(invitationId: string): Promise<void> {
    return withDbError(async () => {
      await db
        .update(invitations)
        .set({ status: "expired" })
        .where(
          and(
            eq(invitations.id, invitationId),
            eq(invitations.status, "pending"),
            isNull(invitations.acceptedAt),
          ),
        )
    })
  },
}
