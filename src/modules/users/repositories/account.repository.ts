import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinicMemberships, clinics, roles, user } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toAccountMembershipSummary,
  toAccountOverview,
  toAccountProfile,
} from "@/modules/users/mappers/account.mapper"
import type {
  AccountOverview,
  AccountProfile,
} from "@/modules/users/types/account"

export const accountRepository = {
  async findOverview(
    userId: string,
    activeClinicId: string | null,
  ): Promise<AccountOverview | null> {
    return withDbError(async () => {
      const [userRow] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          phone: user.phone,
          image: user.image,
          status: user.status,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      if (!userRow) return null

      const membershipRows = await db
        .select({
          clinicId: clinicMemberships.clinicId,
          clinicName: clinics.name,
          roleName: roles.name,
          roleKey: roles.key,
          status: clinicMemberships.status,
          isDefault: clinicMemberships.isDefault,
        })
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .leftJoin(
          clinics,
          and(
            eq(clinics.id, clinicMemberships.clinicId),
            isNull(clinics.deletedAt),
          ),
        )
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            inArray(clinicMemberships.status, ["active", "suspended"]),
            isNull(clinicMemberships.deletedAt),
          ),
        )

      return toAccountOverview({
        user: userRow,
        memberships: membershipRows.map((row) =>
          toAccountMembershipSummary({
            ...row,
            isCurrent: Boolean(
              activeClinicId && row.clinicId === activeClinicId,
            ),
          }),
        ),
      })
    })
  },

  async findProfile(userId: string): Promise<AccountProfile | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)

      return row ? toAccountProfile(row) : null
    })
  },

  async updateProfile(params: {
    userId: string
    name: string
    phone: string | null
  }): Promise<AccountProfile | null> {
    return withDbError(async () => {
      const [row] = await db
        .update(user)
        .set({
          name: params.name,
          phone: params.phone,
        })
        .where(eq(user.id, params.userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        })

      return row ? toAccountProfile(row) : null
    })
  },
}
