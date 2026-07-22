import { and, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinicMemberships, roles } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toAuthMembership } from "@/modules/authentication/mappers/auth.mapper"
import type { AuthMembership } from "@/modules/authentication/types/auth"

/**
 * Membership reads for auth context / clinic switcher.
 * When FORCE RLS is enabled, prefer a Pool driver + tenant GUCs
 * (`withTenantContext`) — Neon HTTP does not share session state.
 */
export const membershipRepository = {
  async findActiveByUserAndClinic(
    userId: string,
    clinicId: string,
  ): Promise<AuthMembership | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: clinicMemberships.id,
          clinicId: clinicMemberships.clinicId,
          roleId: clinicMemberships.roleId,
          roleKey: roles.key,
          roleName: roles.name,
          isDefault: clinicMemberships.isDefault,
          status: clinicMemberships.status,
        })
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            eq(clinicMemberships.clinicId, clinicId),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1)

      return row ? toAuthMembership(row) : null
    })
  },

  async findDefaultByUser(userId: string): Promise<AuthMembership | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: clinicMemberships.id,
          clinicId: clinicMemberships.clinicId,
          roleId: clinicMemberships.roleId,
          roleKey: roles.key,
          roleName: roles.name,
          isDefault: clinicMemberships.isDefault,
          status: clinicMemberships.status,
        })
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            eq(clinicMemberships.isDefault, true),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1)

      return row ? toAuthMembership(row) : null
    })
  },

  async listActiveByUser(userId: string): Promise<AuthMembership[]> {
    return withDbError(async () => {
      const rows = await db
        .select({
          id: clinicMemberships.id,
          clinicId: clinicMemberships.clinicId,
          roleId: clinicMemberships.roleId,
          roleKey: roles.key,
          roleName: roles.name,
          isDefault: clinicMemberships.isDefault,
          status: clinicMemberships.status,
        })
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )

      return rows.map(toAuthMembership)
    })
  },
}
