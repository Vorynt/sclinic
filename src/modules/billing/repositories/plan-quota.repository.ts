import { and, count, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { clinicMemberships, professionalClinics } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { PlanQuotaUsage } from "@/modules/billing/utils/plan-quota"

/**
 * Metering reads for plan quota (ADR-004).
 * Cross-table counts are intentional — billing owns entitlement metering.
 */
export const planQuotaRepository = {
  async getUsageByClinic(clinicId: string): Promise<PlanQuotaUsage> {
    return withDbError(async () => {
      const [usersRow, professionalsRow] = await Promise.all([
        db
          .select({ total: count() })
          .from(clinicMemberships)
          .where(
            and(
              eq(clinicMemberships.clinicId, clinicId),
              inArray(clinicMemberships.status, ["active", "suspended"]),
              isNull(clinicMemberships.deletedAt),
            ),
          ),
        db
          .select({ total: count() })
          .from(professionalClinics)
          .where(
            and(
              eq(professionalClinics.clinicId, clinicId),
              eq(professionalClinics.status, "active"),
              isNull(professionalClinics.deletedAt),
            ),
          ),
      ])

      return {
        users: usersRow[0]?.total ?? 0,
        professionals: professionalsRow[0]?.total ?? 0,
        // Storage metering lands with the upload feature.
        storageBytes: 0,
      }
    })
  },
}
