import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinicBusinessHours } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toClinicWeeklyHours,
  toDbTime,
} from "@/modules/clinics/mappers/clinic-hours.mapper"
import type { ClinicDayHours, ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"

function dayToRowValues(day: ClinicDayHours) {
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

export const clinicHoursRepository = {
  async findByClinicId(clinicId: string): Promise<ClinicWeeklyHours> {
    return withDbError(async () => {
      const rows = await db
        .select()
        .from(clinicBusinessHours)
        .where(
          and(
            eq(clinicBusinessHours.clinicId, clinicId),
            isNull(clinicBusinessHours.deletedAt),
          ),
        )
        .orderBy(asc(clinicBusinessHours.dayOfWeek))

      return toClinicWeeklyHours(rows)
    })
  },

  async hasAnyForClinic(clinicId: string): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: clinicBusinessHours.id })
        .from(clinicBusinessHours)
        .where(
          and(
            eq(clinicBusinessHours.clinicId, clinicId),
            isNull(clinicBusinessHours.deletedAt),
          ),
        )
        .limit(1)

      return Boolean(row)
    })
  },

  /**
   * Replaces the full week for a clinic (soft-deletes previous rows, inserts 7).
   */
  async replaceWeeklyHours(params: {
    clinicId: string
    days: ClinicDayHours[]
  }): Promise<ClinicWeeklyHours> {
    return withDbError(async () => {
      const now = new Date()

      await db
        .update(clinicBusinessHours)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(clinicBusinessHours.clinicId, params.clinicId),
            isNull(clinicBusinessHours.deletedAt),
          ),
        )

      const values = params.days.map((day) => ({
        clinicId: params.clinicId,
        ...dayToRowValues(day),
      }))

      const rows = await db
        .insert(clinicBusinessHours)
        .values(values)
        .returning()

      return toClinicWeeklyHours(rows)
    })
  },
}
