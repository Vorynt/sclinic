import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import {
  appointments,
  clinicBusinessHours,
  clinics,
  invitations,
  patients,
  professionalClinics,
} from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreateClinicDto } from "@/modules/clinics/dto/create-clinic.dto"
import type { UpdateClinicDto } from "@/modules/clinics/dto/update-clinic.dto"
import { toClinic } from "@/modules/clinics/mappers/clinic.mapper"
import type { Clinic, ClinicSubscriptionStatus } from "@/modules/clinics/types/clinic"

export const clinicRepository = {
  async findById(id: string): Promise<Clinic | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(clinics)
        .where(and(eq(clinics.id, id), isNull(clinics.deletedAt)))
        .limit(1)

      return row ? toClinic(row) : null
    })
  },

  async findByIds(ids: string[]): Promise<Clinic[]> {
    if (ids.length === 0) return []

    return withDbError(async () => {
      const rows = await db
        .select()
        .from(clinics)
        .where(and(inArray(clinics.id, ids), isNull(clinics.deletedAt)))

      return rows.map(toClinic)
    })
  },

  async create(
    data: Omit<CreateClinicDto, "planId"> & {
      createdBy: string
      subscriptionStatus?: Clinic["subscriptionStatus"]
    },
  ): Promise<Clinic> {
    return withDbError(async () => {
      const [row] = await db
        .insert(clinics)
        .values({
          name: data.name,
          tradeName: data.tradeName ?? null,
          document: data.document ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          addressStreet: data.addressStreet ?? null,
          addressNumber: data.addressNumber ?? null,
          addressComplement: data.addressComplement ?? null,
          addressNeighborhood: data.addressNeighborhood ?? null,
          addressCity: data.addressCity ?? null,
          addressState: data.addressState ?? null,
          addressZip: data.addressZip ?? null,
          subscriptionStatus: data.subscriptionStatus ?? "incomplete",
          createdBy: data.createdBy,
          updatedBy: data.createdBy,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to create clinic")
      }

      return toClinic(row)
    })
  },

  async update(params: {
    id: string
    updatedBy: string
    data: UpdateClinicDto
  }): Promise<Clinic> {
    return withDbError(async () => {
      const data = params.data

      const [row] = await db
        .update(clinics)
        .set({
          name: data.name,
          tradeName: data.tradeName ?? null,
          document: data.document ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          website: data.website ?? null,
          timezone: data.timezone,
          addressStreet: data.addressStreet ?? null,
          addressNumber: data.addressNumber ?? null,
          addressComplement: data.addressComplement ?? null,
          addressNeighborhood: data.addressNeighborhood ?? null,
          addressCity: data.addressCity ?? null,
          addressState: data.addressState ?? null,
          addressZip: data.addressZip ?? null,
          updatedBy: params.updatedBy,
        })
        .where(and(eq(clinics.id, params.id), isNull(clinics.deletedAt)))
        .returning()

      if (!row) {
        throw new Error("Clinic not found for update")
      }

      return toClinic(row)
    })
  },

  async updateSubscriptionStatus(
    clinicId: string,
    subscriptionStatus: ClinicSubscriptionStatus,
  ): Promise<void> {
    return withDbError(async () => {
      await db
        .update(clinics)
        .set({ subscriptionStatus })
        .where(and(eq(clinics.id, clinicId), isNull(clinics.deletedAt)))
    })
  },

  /**
   * Soft-deletes the clinic and its operational data (tenant wipe).
   * Memberships / sessions are handled by auth after this.
   * SaaS subscription stays on the user (ADR-003).
   */
  async softDeleteTenant(params: {
    id: string
    updatedBy: string
  }): Promise<void> {
    return withDbError(async () => {
      const now = new Date()

      await db
        .update(appointments)
        .set({
          deletedAt: now,
          status: "canceled",
          canceledAt: now,
          canceledReason: "Clínica excluída",
          updatedAt: now,
        })
        .where(
          and(
            eq(appointments.clinicId, params.id),
            isNull(appointments.deletedAt),
          ),
        )

      await db
        .update(patients)
        .set({
          deletedAt: now,
          status: "archived",
          updatedBy: params.updatedBy,
          updatedAt: now,
        })
        .where(and(eq(patients.clinicId, params.id), isNull(patients.deletedAt)))

      await db
        .update(clinicBusinessHours)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(clinicBusinessHours.clinicId, params.id),
            isNull(clinicBusinessHours.deletedAt),
          ),
        )

      await db
        .update(professionalClinics)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(professionalClinics.clinicId, params.id),
            isNull(professionalClinics.deletedAt),
          ),
        )

      await db
        .update(invitations)
        .set({
          status: "revoked",
          updatedAt: now,
        })
        .where(
          and(
            eq(invitations.clinicId, params.id),
            inArray(invitations.status, ["pending", "resent"]),
          ),
        )

      const [row] = await db
        .update(clinics)
        .set({
          deletedAt: now,
          updatedBy: params.updatedBy,
          updatedAt: now,
          subscriptionStatus: "canceled",
        })
        .where(and(eq(clinics.id, params.id), isNull(clinics.deletedAt)))
        .returning({ id: clinics.id })

      if (!row) {
        throw new Error("Clinic not found for delete")
      }
    })
  },
}
