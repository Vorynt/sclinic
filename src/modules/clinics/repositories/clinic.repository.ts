import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinics } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toClinic } from "@/modules/clinics/mappers/clinic.mapper"
import type { CreateClinicDto } from "@/modules/clinics/dto/create-clinic.dto"
import type { Clinic } from "@/modules/clinics/types/clinic"

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
}
