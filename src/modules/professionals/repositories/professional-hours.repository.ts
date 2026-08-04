import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import { professionalBusinessHours } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toDbTime,
  toProfessionalWeeklyHours,
} from "@/modules/professionals/mappers/professional-hours.mapper"
import type {
  ProfessionalDayHours,
  ProfessionalWeeklyHours,
} from "@/modules/professionals/types/professional-hours"

function dayToRowValues(day: ProfessionalDayHours) {
  if (day.isClosed || day.intervals.length === 0) {
    return {
      dayOfWeek: day.dayOfWeek,
      isClosed: true,
      opensAt: null,
      closesAt: null,
      secondOpensAt: null,
      secondClosesAt: null,
    }
  }

  const [first, second] = day.intervals

  return {
    dayOfWeek: day.dayOfWeek,
    isClosed: false,
    opensAt: first ? toDbTime(first.opensAt) : null,
    closesAt: first ? toDbTime(first.closesAt) : null,
    secondOpensAt: second ? toDbTime(second.opensAt) : null,
    secondClosesAt: second ? toDbTime(second.closesAt) : null,
  }
}

export const professionalHoursRepository = {
  async findByProfessionalId(params: {
    clinicId: string
    professionalId: string
  }): Promise<ProfessionalWeeklyHours> {
    return withDbError(async () => {
      const rows = await db
        .select()
        .from(professionalBusinessHours)
        .where(
          and(
            eq(professionalBusinessHours.clinicId, params.clinicId),
            eq(professionalBusinessHours.professionalId, params.professionalId),
            isNull(professionalBusinessHours.deletedAt),
          ),
        )
        .orderBy(asc(professionalBusinessHours.dayOfWeek))

      return toProfessionalWeeklyHours(rows)
    })
  },

  async hasAnyForProfessional(params: {
    clinicId: string
    professionalId: string
  }): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: professionalBusinessHours.id })
        .from(professionalBusinessHours)
        .where(
          and(
            eq(professionalBusinessHours.clinicId, params.clinicId),
            eq(professionalBusinessHours.professionalId, params.professionalId),
            isNull(professionalBusinessHours.deletedAt),
          ),
        )
        .limit(1)

      return Boolean(row)
    })
  },

  /**
   * Replaces the full week for a professional (soft-deletes previous rows, inserts 7).
   */
  async replaceWeeklyHours(params: {
    clinicId: string
    professionalId: string
    days: ProfessionalDayHours[]
  }): Promise<ProfessionalWeeklyHours> {
    return withDbError(async () => {
      const now = new Date()

      await db
        .update(professionalBusinessHours)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(professionalBusinessHours.clinicId, params.clinicId),
            eq(professionalBusinessHours.professionalId, params.professionalId),
            isNull(professionalBusinessHours.deletedAt),
          ),
        )

      const values = params.days.map((day) => ({
        clinicId: params.clinicId,
        professionalId: params.professionalId,
        ...dayToRowValues(day),
      }))

      const rows = await db
        .insert(professionalBusinessHours)
        .values(values)
        .returning()

      return toProfessionalWeeklyHours(rows)
    })
  },
}
