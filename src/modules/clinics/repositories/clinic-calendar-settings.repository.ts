import { eq } from "drizzle-orm"

import { db } from "@/db"
import { clinicCalendarSettings } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { mergeClinicCalendarSettings } from "@/modules/clinics/utils/merge-clinic-calendar-settings"
import type { ClinicCalendarSettings } from "@/modules/clinics/types/clinic-calendar-settings"

export const clinicCalendarSettingsRepository = {
  async findByClinicId(clinicId: string): Promise<ClinicCalendarSettings> {
    return withDbError(async () => {
      const [row] = await db
        .select({ settings: clinicCalendarSettings.settings })
        .from(clinicCalendarSettings)
        .where(eq(clinicCalendarSettings.clinicId, clinicId))
        .limit(1)

      return mergeClinicCalendarSettings(row?.settings ?? null)
    })
  },

  async upsert(params: {
    clinicId: string
    settings: ClinicCalendarSettings
  }): Promise<ClinicCalendarSettings> {
    return withDbError(async () => {
      const [row] = await db
        .insert(clinicCalendarSettings)
        .values({
          clinicId: params.clinicId,
          settings: params.settings,
        })
        .onConflictDoUpdate({
          target: clinicCalendarSettings.clinicId,
          set: {
            settings: params.settings,
            updatedAt: new Date(),
          },
        })
        .returning({ settings: clinicCalendarSettings.settings })

      return mergeClinicCalendarSettings(row?.settings ?? params.settings)
    })
  },
}
