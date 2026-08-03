import { and, asc, count, eq, ilike, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinicServices } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreateClinicServiceDto } from "@/modules/billing/dto/create-clinic-service.dto"
import type { UpdateClinicServiceDto } from "@/modules/billing/dto/update-clinic-service.dto"
import { toClinicService } from "@/modules/billing/mappers/clinic-service.mapper"
import type { ClinicService } from "@/modules/billing/types/clinic-service"
import {
  toPaginatedResult,
  type PaginatedResult,
} from "@/types/pagination"

function buildNameSearchCondition(q: string) {
  return ilike(clinicServices.name, `%${q}%`)
}

export const clinicServiceRepository = {
  async findById(id: string, clinicId: string): Promise<ClinicService | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(clinicServices)
        .where(
          and(
            eq(clinicServices.id, id),
            eq(clinicServices.clinicId, clinicId),
          ),
        )
        .limit(1)

      return row ? toClinicService(row) : null
    })
  },

  async findActiveById(
    id: string,
    clinicId: string,
  ): Promise<ClinicService | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(clinicServices)
        .where(
          and(
            eq(clinicServices.id, id),
            eq(clinicServices.clinicId, clinicId),
            eq(clinicServices.isActive, true),
            isNull(clinicServices.deletedAt),
          ),
        )
        .limit(1)

      return row ? toClinicService(row) : null
    })
  },

  async listByClinic(params: {
    clinicId: string
    q?: string
    isActive?: boolean
    page: number
    pageSize: number
  }): Promise<PaginatedResult<ClinicService>> {
    return withDbError(async () => {
      const where = and(
        eq(clinicServices.clinicId, params.clinicId),
        params.q ? buildNameSearchCondition(params.q) : undefined,
        params.isActive !== undefined
          ? eq(clinicServices.isActive, params.isActive)
          : undefined,
      )

      const offset = (params.page - 1) * params.pageSize

      const [totalRow, rows] = await Promise.all([
        db.select({ total: count() }).from(clinicServices).where(where),
        db
          .select()
          .from(clinicServices)
          .where(where)
          .orderBy(asc(clinicServices.name))
          .limit(params.pageSize)
          .offset(offset),
      ])

      return toPaginatedResult({
        items: rows.map(toClinicService),
        total: totalRow[0]?.total ?? 0,
        page: params.page,
        pageSize: params.pageSize,
      })
    })
  },

  async listActiveByClinic(params: {
    clinicId: string
    q?: string
  }): Promise<ClinicService[]> {
    return withDbError(async () => {
      const rows = await db
        .select()
        .from(clinicServices)
        .where(
          and(
            eq(clinicServices.clinicId, params.clinicId),
            eq(clinicServices.isActive, true),
            isNull(clinicServices.deletedAt),
            params.q ? buildNameSearchCondition(params.q) : undefined,
          ),
        )
        .orderBy(asc(clinicServices.name))
        .limit(100)

      return rows.map(toClinicService)
    })
  },

  async create(params: {
    clinicId: string
    createdBy: string
    data: CreateClinicServiceDto
  }): Promise<ClinicService> {
    return withDbError(async () => {
      const [row] = await db
        .insert(clinicServices)
        .values({
          clinicId: params.clinicId,
          name: params.data.name,
          description: params.data.description ?? null,
          priceCents: params.data.priceCents,
          isActive: params.data.isActive,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to create clinic service")
      }

      return toClinicService(row)
    })
  },

  async update(params: {
    id: string
    clinicId: string
    updatedBy: string
    data: Omit<UpdateClinicServiceDto, "id">
  }): Promise<ClinicService> {
    return withDbError(async () => {
      const { name, description, priceCents, isActive } = params.data

      const [row] = await db
        .update(clinicServices)
        .set({
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(priceCents !== undefined ? { priceCents } : {}),
          ...(isActive !== undefined
            ? {
                isActive,
                // Reactivating clears prior soft-delete from early deactivate flow
                ...(isActive ? { deletedAt: null } : {}),
              }
            : {}),
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(clinicServices.id, params.id),
            eq(clinicServices.clinicId, params.clinicId),
          ),
        )
        .returning()

      if (!row) {
        throw new Error("Clinic service not found for update")
      }

      return toClinicService(row)
    })
  },

  async softDelete(params: {
    id: string
    clinicId: string
    updatedBy: string
  }): Promise<void> {
    return withDbError(async () => {
      const [row] = await db
        .update(clinicServices)
        .set({
          isActive: false,
          deletedAt: null,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(clinicServices.id, params.id),
            eq(clinicServices.clinicId, params.clinicId),
          ),
        )
        .returning({ id: clinicServices.id })

      if (!row) {
        throw new Error("Clinic service not found for delete")
      }
    })
  },
}
