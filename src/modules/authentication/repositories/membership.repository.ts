import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinicMemberships, clinics, roles } from "@/db/schema"
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

  /**
   * Any non-removed membership for the user+clinic pair (incl. suspended).
   */
  async findByUserAndClinic(
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
            inArray(clinicMemberships.status, ["active", "suspended"]),
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

  /** Active owner user id for a clinic (SaaS payer — ADR-003 / ADR-004). */
  async findActiveOwnerUserIdByClinic(
    clinicId: string,
  ): Promise<string | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({ userId: clinicMemberships.userId })
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .where(
          and(
            eq(clinicMemberships.clinicId, clinicId),
            eq(roles.key, "owner"),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1)

      return row?.userId ?? null
    })
  },

  /** Active owner memberships for a user (owned clinics). */
  async listOwnerByUser(userId: string): Promise<AuthMembership[]> {
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
            eq(roles.key, "owner"),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )

      return rows.map(toAuthMembership)
    })
  },

  /**
   * Clinics shown in the switcher: active (selectable) + suspended (disabled).
   * Left-joins clinic name (RLS may hide suspended tenants until policy allows).
   */
  async listForClinicSwitcher(userId: string): Promise<AuthMembership[]> {
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
          clinicName: clinics.name,
          clinicSubscriptionStatus: clinics.subscriptionStatus,
        })
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .leftJoin(
          clinics,
          and(eq(clinics.id, clinicMemberships.clinicId), isNull(clinics.deletedAt)),
        )
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            inArray(clinicMemberships.status, ["active", "suspended"]),
            isNull(clinicMemberships.deletedAt),
          ),
        )

      return rows.map(toAuthMembership)
    })
  },

  async hasSuspendedByUser(userId: string): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: clinicMemberships.id })
        .from(clinicMemberships)
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            eq(clinicMemberships.status, "suspended"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1)

      return Boolean(row)
    })
  },

  async findSystemRoleIdByKey(key: string): Promise<string | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(
          and(
            eq(roles.key, key),
            eq(roles.isSystem, true),
            isNull(roles.clinicId),
            isNull(roles.deletedAt),
          ),
        )
        .limit(1)

      return row?.id ?? null
    })
  },

  async create({
    userId,
    clinicId,
    roleId,
    isDefault = true,
  }: {
    userId: string
    clinicId: string
    roleId: string
    isDefault?: boolean
  }): Promise<AuthMembership> {
    return withDbError(async () => {
      // Unique partial index: at most one is_default=true per user.
      // Owner onboarding (ADR-003) takes over default from a prior guest membership.
      if (isDefault) {
        const now = new Date()
        await db
          .update(clinicMemberships)
          .set({ isDefault: false, updatedAt: now })
          .where(
            and(
              eq(clinicMemberships.userId, userId),
              eq(clinicMemberships.isDefault, true),
              isNull(clinicMemberships.deletedAt),
            ),
          )
      }

      const [row] = await db
        .insert(clinicMemberships)
        .values({
          userId,
          clinicId,
          roleId,
          isDefault,
          status: "active",
        })
        .returning({
          id: clinicMemberships.id,
          clinicId: clinicMemberships.clinicId,
          roleId: clinicMemberships.roleId,
          isDefault: clinicMemberships.isDefault,
          status: clinicMemberships.status,
        })

      if (!row) {
        throw new Error("Failed to create membership")
      }

      const [withRole] = await db
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
        .where(eq(clinicMemberships.id, row.id))
        .limit(1)

      if (!withRole) {
        throw new Error("Failed to load membership after create")
      }

      return toAuthMembership(withRole)
    })
  },

  async softDeleteAllForClinic(clinicId: string): Promise<void> {
    return withDbError(async () => {
      const now = new Date()
      await db
        .update(clinicMemberships)
        .set({
          status: "removed",
          deletedAt: now,
          isDefault: false,
          updatedAt: now,
        })
        .where(
          and(
            eq(clinicMemberships.clinicId, clinicId),
            isNull(clinicMemberships.deletedAt),
          ),
        )
    })
  },
}
