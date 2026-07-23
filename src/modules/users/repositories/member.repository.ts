import { and, eq, inArray, isNull, ne } from "drizzle-orm";

import { db } from "@/db";
import { clinicMemberships, roles, user } from "@/db/schema";
import { withDbError } from "@/db/with-db-error";
import { toClinicMember } from "@/modules/users/mappers/member.mapper";
import type { ClinicMember } from "@/modules/users/types/member";

const memberSelect = {
  id: clinicMemberships.id,
  userId: clinicMemberships.userId,
  clinicId: clinicMemberships.clinicId,
  roleId: clinicMemberships.roleId,
  roleKey: roles.key,
  roleName: roles.name,
  status: clinicMemberships.status,
  isDefault: clinicMemberships.isDefault,
  joinedAt: clinicMemberships.joinedAt,
  userName: user.name,
  userEmail: user.email,
  userImage: user.image,
};

export const memberRepository = {
  async listByClinic(clinicId: string): Promise<ClinicMember[]> {
    return withDbError(async () => {
      const rows = await db
        .select(memberSelect)
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .innerJoin(user, eq(user.id, clinicMemberships.userId))
        .where(
          and(
            eq(clinicMemberships.clinicId, clinicId),
            inArray(clinicMemberships.status, ["active", "suspended"]),
            isNull(clinicMemberships.deletedAt),
          ),
        );

      return rows.map(toClinicMember);
    });
  },

  async findById(
    membershipId: string,
    clinicId: string,
  ): Promise<ClinicMember | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(memberSelect)
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .innerJoin(user, eq(user.id, clinicMemberships.userId))
        .where(
          and(
            eq(clinicMemberships.id, membershipId),
            eq(clinicMemberships.clinicId, clinicId),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1);

      return row ? toClinicMember(row) : null;
    });
  },

  async findActiveByUserAndClinic(
    userId: string,
    clinicId: string,
  ): Promise<ClinicMember | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(memberSelect)
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .innerJoin(user, eq(user.id, clinicMemberships.userId))
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            eq(clinicMemberships.clinicId, clinicId),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1);

      return row ? toClinicMember(row) : null;
    });
  },

  async findActiveByEmailAndClinic(
    email: string,
    clinicId: string,
  ): Promise<ClinicMember | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(memberSelect)
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .innerJoin(user, eq(user.id, clinicMemberships.userId))
        .where(
          and(
            eq(user.email, email.toLowerCase()),
            eq(clinicMemberships.clinicId, clinicId),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1);

      return row ? toClinicMember(row) : null;
    });
  },

  async create(params: {
    userId: string;
    clinicId: string;
    roleId: string;
    isDefault?: boolean;
  }): Promise<ClinicMember> {
    return withDbError(async () => {
      const hasDefault = await db
        .select({ id: clinicMemberships.id })
        .from(clinicMemberships)
        .where(
          and(
            eq(clinicMemberships.userId, params.userId),
            eq(clinicMemberships.isDefault, true),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1);

      const isDefault = params.isDefault ?? hasDefault.length === 0;

      const [row] = await db
        .insert(clinicMemberships)
        .values({
          userId: params.userId,
          clinicId: params.clinicId,
          roleId: params.roleId,
          isDefault,
          status: "active",
        })
        .returning({ id: clinicMemberships.id });

      if (!row) {
        throw new Error("Failed to create membership");
      }

      const created = await memberRepository.findById(row.id, params.clinicId);
      if (!created) {
        throw new Error("Failed to load membership after create");
      }
      return created;
    });
  },

  async updateRole(
    membershipId: string,
    clinicId: string,
    roleId: string,
  ): Promise<ClinicMember> {
    return withDbError(async () => {
      const [updated] = await db
        .update(clinicMemberships)
        .set({ roleId })
        .where(
          and(
            eq(clinicMemberships.id, membershipId),
            eq(clinicMemberships.clinicId, clinicId),
            ne(clinicMemberships.status, "removed"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .returning({ id: clinicMemberships.id });

      if (!updated) {
        throw new Error("Membership not found for role update");
      }

      const member = await memberRepository.findById(membershipId, clinicId);
      if (!member) {
        throw new Error("Failed to load membership after role update");
      }
      return member;
    });
  },

  async softRemove(membershipId: string, clinicId: string): Promise<void> {
    return withDbError(async () => {
      await db
        .update(clinicMemberships)
        .set({
          status: "suspended",
          isDefault: false,
        })
        .where(
          and(
            eq(clinicMemberships.id, membershipId),
            eq(clinicMemberships.clinicId, clinicId),
            ne(clinicMemberships.status, "removed"),
            isNull(clinicMemberships.deletedAt),
          ),
        );
    });
  },

  async setStatus(
    membershipId: string,
    clinicId: string,
    status: "active" | "suspended",
  ): Promise<ClinicMember> {
    return withDbError(async () => {
      const [updated] = await db
        .update(clinicMemberships)
        .set({
          status,
          ...(status === "suspended" ? { isDefault: false } : {}),
        })
        .where(
          and(
            eq(clinicMemberships.id, membershipId),
            eq(clinicMemberships.clinicId, clinicId),
            ne(clinicMemberships.status, "removed"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .returning({ id: clinicMemberships.id });

      if (!updated) {
        throw new Error("Membership not found for status update");
      }

      const member = await memberRepository.findById(membershipId, clinicId);
      if (!member) {
        throw new Error("Failed to load membership after status update");
      }
      return member;
    });
  },

  /**
   * Any non-removed membership for user+clinic (active or suspended).
   */
  async findByUserAndClinic(
    userId: string,
    clinicId: string,
  ): Promise<ClinicMember | null> {
    return withDbError(async () => {
      const [row] = await db
        .select(memberSelect)
        .from(clinicMemberships)
        .innerJoin(roles, eq(roles.id, clinicMemberships.roleId))
        .innerJoin(user, eq(user.id, clinicMemberships.userId))
        .where(
          and(
            eq(clinicMemberships.userId, userId),
            eq(clinicMemberships.clinicId, clinicId),
            inArray(clinicMemberships.status, ["active", "suspended"]),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .limit(1);

      return row ? toClinicMember(row) : null;
    });
  },
};
