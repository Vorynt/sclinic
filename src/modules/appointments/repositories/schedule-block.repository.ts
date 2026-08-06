import {
  and,
  asc,
  eq,
  gt,
  inArray,
  isNull,
  lt,
  ne,
  or,
} from "drizzle-orm"

import { db } from "@/db"
import {
  professionalDisplayNameSql,
  professionals,
  scheduleBlocks,
} from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreateScheduleBlockDto } from "@/modules/appointments/dto/create-schedule-block.dto"
import { toScheduleBlock } from "@/modules/appointments/mappers/schedule-block.mapper"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"

const blockSelect = {
  id: scheduleBlocks.id,
  clinicId: scheduleBlocks.clinicId,
  professionalId: scheduleBlocks.professionalId,
  professionalName: professionalDisplayNameSql,
  startsAt: scheduleBlocks.startsAt,
  endsAt: scheduleBlocks.endsAt,
  reason: scheduleBlocks.reason,
  createdAt: scheduleBlocks.createdAt,
  updatedAt: scheduleBlocks.updatedAt,
}

function blockJoin() {
  return db
    .select(blockSelect)
    .from(scheduleBlocks)
    .leftJoin(professionals, eq(professionals.id, scheduleBlocks.professionalId))
}

/** Professional filter also keeps clinic-wide blocks (null professionalId). */
function professionalScopeFilter(professionalIds: string[]) {
  return or(
    inArray(scheduleBlocks.professionalId, professionalIds),
    isNull(scheduleBlocks.professionalId),
  )
}

/** Busy for a professional = their blocks ∪ clinic-wide. */
function busyForProfessionalFilter(professionalId: string) {
  return or(
    eq(scheduleBlocks.professionalId, professionalId),
    isNull(scheduleBlocks.professionalId),
  )
}

export const scheduleBlockRepository = {
  async listByRange(params: {
    clinicId: string
    from: Date
    to: Date
    professionalIds?: string[]
  }): Promise<ScheduleBlock[]> {
    return withDbError(async () => {
      const rows = await blockJoin()
        .where(
          and(
            eq(scheduleBlocks.clinicId, params.clinicId),
            isNull(scheduleBlocks.deletedAt),
            lt(scheduleBlocks.startsAt, params.to),
            gt(scheduleBlocks.endsAt, params.from),
            params.professionalIds?.length
              ? professionalScopeFilter(params.professionalIds)
              : undefined,
          ),
        )
        .orderBy(asc(scheduleBlocks.startsAt))

      return rows.map(toScheduleBlock)
    })
  },

  async findById(
    id: string,
    clinicId: string,
  ): Promise<ScheduleBlock | null> {
    return withDbError(async () => {
      const [row] = await blockJoin()
        .where(
          and(
            eq(scheduleBlocks.id, id),
            eq(scheduleBlocks.clinicId, clinicId),
            isNull(scheduleBlocks.deletedAt),
          ),
        )
        .limit(1)

      return row ? toScheduleBlock(row) : null
    })
  },

  async hasOverlappingBlock(params: {
    clinicId: string
    professionalId: string
    startsAt: Date
    endsAt: Date
    excludeBlockId?: string
  }): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: scheduleBlocks.id })
        .from(scheduleBlocks)
        .where(
          and(
            eq(scheduleBlocks.clinicId, params.clinicId),
            busyForProfessionalFilter(params.professionalId),
            isNull(scheduleBlocks.deletedAt),
            lt(scheduleBlocks.startsAt, params.endsAt),
            gt(scheduleBlocks.endsAt, params.startsAt),
            params.excludeBlockId
              ? ne(scheduleBlocks.id, params.excludeBlockId)
              : undefined,
          ),
        )
        .limit(1)

      return Boolean(row)
    })
  },

  async listBusyIntervals(params: {
    clinicId: string
    professionalId: string
    from: Date
    to: Date
  }): Promise<{ startsAt: Date; endsAt: Date }[]> {
    return withDbError(async () => {
      return db
        .select({
          startsAt: scheduleBlocks.startsAt,
          endsAt: scheduleBlocks.endsAt,
        })
        .from(scheduleBlocks)
        .where(
          and(
            eq(scheduleBlocks.clinicId, params.clinicId),
            busyForProfessionalFilter(params.professionalId),
            isNull(scheduleBlocks.deletedAt),
            lt(scheduleBlocks.startsAt, params.to),
            gt(scheduleBlocks.endsAt, params.from),
          ),
        )
        .orderBy(asc(scheduleBlocks.startsAt))
    })
  },

  async create(params: {
    clinicId: string
    createdBy: string
    data: CreateScheduleBlockDto
  }): Promise<ScheduleBlock> {
    return withDbError(async () => {
      const [row] = await db
        .insert(scheduleBlocks)
        .values({
          clinicId: params.clinicId,
          professionalId: params.data.professionalId,
          startsAt: params.data.startsAt,
          endsAt: params.data.endsAt,
          reason: params.data.reason ?? null,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({ id: scheduleBlocks.id })

      const created = await this.findById(row!.id, params.clinicId)
      if (!created) {
        throw new Error("Schedule block not found after create")
      }
      return created
    })
  },

  async softDelete(params: {
    id: string
    clinicId: string
    updatedBy: string
  }): Promise<ScheduleBlock | null> {
    return withDbError(async () => {
      const existing = await this.findById(params.id, params.clinicId)
      if (!existing) return null

      await db
        .update(scheduleBlocks)
        .set({
          deletedAt: new Date(),
          updatedBy: params.updatedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(scheduleBlocks.id, params.id),
            eq(scheduleBlocks.clinicId, params.clinicId),
            isNull(scheduleBlocks.deletedAt),
          ),
        )

      return existing
    })
  },
}
