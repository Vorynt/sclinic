import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import {
  clinicMemberships,
  invitations,
  professionalClinics,
  professionals,
  roles,
  user,
} from "@/db/schema";
import { withDbError } from "@/db/with-db-error";
import {
  toProfessionalListItem,
  type ProfessionalListRow,
} from "@/modules/professionals/mappers/professional.mapper";
import type {
  AffiliationType,
  CouncilType,
  ProfessionalListItem,
  ProfessionalStatus,
} from "@/modules/professionals/types/professional";

const invitationRoles = alias(roles, "invitation_roles");
const membershipRoles = alias(roles, "membership_roles");

const INVITE_LIST_STATUSES = [
  "pending",
  "resent",
  "expired",
  "revoked",
] as const;

const listSelect = {
  id: professionals.id,
  fullName: professionals.fullName,
  email: sql<string | null>`coalesce(${invitations.email}, ${user.email})`,
  roleKey: sql<
    string | null
  >`coalesce(${invitationRoles.key}, ${membershipRoles.key})`,
  roleName: sql<
    string | null
  >`coalesce(${invitationRoles.name}, ${membershipRoles.name})`,
  affiliationType: professionalClinics.affiliationType,
  affiliationId: professionalClinics.id,
  affiliationStatus: professionalClinics.status,
  status: professionals.status,
  councilType: professionals.councilType,
  councilNumber: professionals.councilNumber,
  councilState: professionals.councilState,
  specialty: professionals.specialty,
  biography: professionals.biography,
  invitationId: invitations.id,
  invitationStatus: invitations.status,
  invitationExpiresAt: invitations.expiresAt,
  userId: professionals.userId,
  createdAt: professionals.createdAt,
  updatedAt: professionals.updatedAt,
};

function mapRows(rows: ProfessionalListRow[]): ProfessionalListItem[] {
  return rows.map(toProfessionalListItem);
}

export const professionalRepository = {
  async create(params: {
    fullName: string;
    status?: ProfessionalStatus;
  }): Promise<{ id: string; fullName: string; status: ProfessionalStatus }> {
    return withDbError(async () => {
      const [row] = await db
        .insert(professionals)
        .values({
          fullName: params.fullName,
          status: params.status ?? "inactive",
        })
        .returning({
          id: professionals.id,
          fullName: professionals.fullName,
          status: professionals.status,
        });

      if (!row) {
        throw new Error("Failed to create professional");
      }

      return {
        id: row.id,
        fullName: row.fullName,
        status: (row.status as ProfessionalStatus) ?? "inactive",
      };
    });
  },

  async createAffiliation(params: {
    professionalId: string;
    clinicId: string;
    affiliationType: AffiliationType;
    status?: "active" | "inactive";
  }): Promise<{ id: string }> {
    return withDbError(async () => {
      const [row] = await db
        .insert(professionalClinics)
        .values({
          professionalId: params.professionalId,
          clinicId: params.clinicId,
          affiliationType: params.affiliationType,
          status: params.status ?? "inactive",
        })
        .returning({ id: professionalClinics.id });

      if (!row) {
        throw new Error("Failed to create professional affiliation");
      }

      return row;
    });
  },

  async findByProfessionalAndClinic(
    professionalId: string,
    clinicId: string,
  ): Promise<{
    id: string;
    affiliationType: AffiliationType;
    status: string;
  } | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: professionalClinics.id,
          affiliationType: professionalClinics.affiliationType,
          status: professionalClinics.status,
        })
        .from(professionalClinics)
        .where(
          and(
            eq(professionalClinics.professionalId, professionalId),
            eq(professionalClinics.clinicId, clinicId),
            isNull(professionalClinics.deletedAt),
          ),
        )
        .limit(1);

      if (!row) return null;

      return {
        id: row.id,
        affiliationType: row.affiliationType as AffiliationType,
        status: row.status,
      };
    });
  },

  async listByClinic(clinicId: string): Promise<ProfessionalListItem[]> {
    return withDbError(async () => {
      const rows = await db
        .selectDistinctOn([professionalClinics.id], listSelect)
        .from(professionalClinics)
        .innerJoin(
          professionals,
          and(
            eq(professionals.id, professionalClinics.professionalId),
            isNull(professionals.deletedAt),
          ),
        )
        .leftJoin(
          invitations,
          and(
            eq(invitations.professionalId, professionals.id),
            eq(invitations.clinicId, clinicId),
            inArray(invitations.status, [...INVITE_LIST_STATUSES]),
          ),
        )
        .leftJoin(invitationRoles, eq(invitationRoles.id, invitations.roleId))
        .leftJoin(user, eq(user.id, professionals.userId))
        .leftJoin(
          clinicMemberships,
          and(
            eq(clinicMemberships.userId, professionals.userId),
            eq(clinicMemberships.clinicId, clinicId),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .leftJoin(
          membershipRoles,
          eq(membershipRoles.id, clinicMemberships.roleId),
        )
        .where(
          and(
            eq(professionalClinics.clinicId, clinicId),
            isNull(professionalClinics.deletedAt),
          ),
        )
        .orderBy(professionalClinics.id, desc(invitations.createdAt));

      return mapRows(rows as ProfessionalListRow[]).sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "pt-BR"),
      );
    });
  },

  async findById(
    id: string,
    clinicId: string,
  ): Promise<ProfessionalListItem | null> {
    return withDbError(async () => {
      const [row] = await db
        .selectDistinctOn([professionalClinics.id], listSelect)
        .from(professionalClinics)
        .innerJoin(
          professionals,
          and(
            eq(professionals.id, professionalClinics.professionalId),
            isNull(professionals.deletedAt),
          ),
        )
        .leftJoin(
          invitations,
          and(
            eq(invitations.professionalId, professionals.id),
            eq(invitations.clinicId, clinicId),
            inArray(invitations.status, [...INVITE_LIST_STATUSES]),
          ),
        )
        .leftJoin(invitationRoles, eq(invitationRoles.id, invitations.roleId))
        .leftJoin(user, eq(user.id, professionals.userId))
        .leftJoin(
          clinicMemberships,
          and(
            eq(clinicMemberships.userId, professionals.userId),
            eq(clinicMemberships.clinicId, clinicId),
            eq(clinicMemberships.status, "active"),
            isNull(clinicMemberships.deletedAt),
          ),
        )
        .leftJoin(
          membershipRoles,
          eq(membershipRoles.id, clinicMemberships.roleId),
        )
        .where(
          and(
            eq(professionals.id, id),
            eq(professionalClinics.clinicId, clinicId),
            isNull(professionalClinics.deletedAt),
          ),
        )
        .orderBy(professionalClinics.id, desc(invitations.createdAt))
        .limit(1);

      return row ? toProfessionalListItem(row as ProfessionalListRow) : null;
    });
  },

  async update(params: {
    id: string;
    clinicId: string;
    data: {
      fullName?: string;
      specialty?: string | null;
      affiliationType?: AffiliationType;
      status?: ProfessionalStatus;
      councilType?: CouncilType | null;
      councilNumber?: string | null;
      councilState?: string | null;
      biography?: string | null;
    };
  }): Promise<ProfessionalListItem> {
    return withDbError(async () => {
      const affiliation =
        await professionalRepository.findByProfessionalAndClinic(
          params.id,
          params.clinicId,
        );
      if (!affiliation) {
        throw new Error("Professional not found for update");
      }

      const {
        fullName,
        specialty,
        affiliationType,
        status,
        councilType,
        councilNumber,
        councilState,
        biography,
      } = params.data;

      const hasProfessionalFields =
        fullName !== undefined ||
        specialty !== undefined ||
        status !== undefined ||
        councilType !== undefined ||
        councilNumber !== undefined ||
        councilState !== undefined ||
        biography !== undefined;

      if (hasProfessionalFields) {
        const [row] = await db
          .update(professionals)
          .set({
            ...(fullName !== undefined ? { fullName } : {}),
            ...(specialty !== undefined ? { specialty } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(councilType !== undefined ? { councilType } : {}),
            ...(councilNumber !== undefined ? { councilNumber } : {}),
            ...(councilState !== undefined ? { councilState } : {}),
            ...(biography !== undefined ? { biography } : {}),
          })
          .where(
            and(
              eq(professionals.id, params.id),
              isNull(professionals.deletedAt),
            ),
          )
          .returning({ id: professionals.id });

        if (!row) {
          throw new Error("Professional not found for update");
        }
      }

      if (affiliationType !== undefined || status !== undefined) {
        await db
          .update(professionalClinics)
          .set({
            ...(affiliationType !== undefined ? { affiliationType } : {}),
            ...(status !== undefined ? { status } : {}),
          })
          .where(
            and(
              eq(professionalClinics.id, affiliation.id),
              isNull(professionalClinics.deletedAt),
            ),
          );
      }

      const updated = await professionalRepository.findById(
        params.id,
        params.clinicId,
      );
      if (!updated) {
        throw new Error("Failed to load professional after update");
      }
      return updated;
    });
  },

  async setStatus(params: {
    id: string;
    clinicId: string;
    status: ProfessionalStatus;
  }): Promise<ProfessionalListItem> {
    return professionalRepository.update({
      id: params.id,
      clinicId: params.clinicId,
      data: { status: params.status },
    });
  },

  async linkUserId(professionalId: string, userId: string): Promise<void> {
    return withDbError(async () => {
      const [row] = await db
        .update(professionals)
        .set({ userId })
        .where(
          and(
            eq(professionals.id, professionalId),
            isNull(professionals.deletedAt),
          ),
        )
        .returning({ id: professionals.id });

      if (!row) {
        throw new Error("Professional not found for linkUserId");
      }
    });
  },

  async softDelete(params: { id: string; clinicId: string }): Promise<void> {
    return withDbError(async () => {
      const now = new Date();

      const [affiliation] = await db
        .update(professionalClinics)
        .set({
          deletedAt: now,
          status: "inactive",
          endedAt: now,
        })
        .where(
          and(
            eq(professionalClinics.professionalId, params.id),
            eq(professionalClinics.clinicId, params.clinicId),
            isNull(professionalClinics.deletedAt),
          ),
        )
        .returning({ id: professionalClinics.id });

      if (!affiliation) {
        throw new Error("Professional affiliation not found for delete");
      }

      await db
        .update(professionals)
        .set({
          deletedAt: now,
          status: "inactive",
        })
        .where(
          and(eq(professionals.id, params.id), isNull(professionals.deletedAt)),
        );
    });
  },

  async activateAfterAccept(params: {
    professionalId: string;
    clinicId: string;
    userId: string;
  }): Promise<void> {
    return withDbError(async () => {
      await db
        .update(professionals)
        .set({
          userId: params.userId,
          status: "active",
        })
        .where(
          and(
            eq(professionals.id, params.professionalId),
            isNull(professionals.deletedAt),
          ),
        );

      await db
        .update(professionalClinics)
        .set({ status: "active" })
        .where(
          and(
            eq(professionalClinics.professionalId, params.professionalId),
            eq(professionalClinics.clinicId, params.clinicId),
            isNull(professionalClinics.deletedAt),
          ),
        );
    });
  },
};
