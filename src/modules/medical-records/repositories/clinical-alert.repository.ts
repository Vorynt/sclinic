import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import { patientClinicalAlerts } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreateClinicalAlertDto } from "@/modules/medical-records/dto/create-clinical-alert.dto"
import { toClinicalAlert } from "@/modules/medical-records/mappers/clinical-alert.mapper"
import type { ClinicalAlert } from "@/modules/medical-records/types/clinical-alert"

export const clinicalAlertRepository = {
  async listByPatient(
    patientId: string,
    clinicId: string,
  ): Promise<ClinicalAlert[]> {
    return withDbError(async () => {
      const rows = await db
        .select({
          id: patientClinicalAlerts.id,
          clinicId: patientClinicalAlerts.clinicId,
          patientId: patientClinicalAlerts.patientId,
          kind: patientClinicalAlerts.kind,
          label: patientClinicalAlerts.label,
          severity: patientClinicalAlerts.severity,
          notes: patientClinicalAlerts.notes,
          createdAt: patientClinicalAlerts.createdAt,
          updatedAt: patientClinicalAlerts.updatedAt,
        })
        .from(patientClinicalAlerts)
        .where(
          and(
            eq(patientClinicalAlerts.clinicId, clinicId),
            eq(patientClinicalAlerts.patientId, patientId),
            isNull(patientClinicalAlerts.deletedAt),
          ),
        )
        .orderBy(
          asc(patientClinicalAlerts.kind),
          asc(patientClinicalAlerts.label),
        )

      const severityRank = { high: 0, medium: 1, low: 2 } as const
      return rows
        .map(toClinicalAlert)
        .sort(
          (a, b) =>
            severityRank[a.severity] - severityRank[b.severity] ||
            a.kind.localeCompare(b.kind) ||
            a.label.localeCompare(b.label),
        )
    })
  },

  async findById(id: string, clinicId: string): Promise<ClinicalAlert | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: patientClinicalAlerts.id,
          clinicId: patientClinicalAlerts.clinicId,
          patientId: patientClinicalAlerts.patientId,
          kind: patientClinicalAlerts.kind,
          label: patientClinicalAlerts.label,
          severity: patientClinicalAlerts.severity,
          notes: patientClinicalAlerts.notes,
          createdAt: patientClinicalAlerts.createdAt,
          updatedAt: patientClinicalAlerts.updatedAt,
        })
        .from(patientClinicalAlerts)
        .where(
          and(
            eq(patientClinicalAlerts.id, id),
            eq(patientClinicalAlerts.clinicId, clinicId),
            isNull(patientClinicalAlerts.deletedAt),
          ),
        )
        .limit(1)

      return row ? toClinicalAlert(row) : null
    })
  },

  async create(params: {
    clinicId: string
    createdBy: string
    data: CreateClinicalAlertDto
  }): Promise<ClinicalAlert> {
    return withDbError(async () => {
      const [row] = await db
        .insert(patientClinicalAlerts)
        .values({
          clinicId: params.clinicId,
          patientId: params.data.patientId,
          kind: params.data.kind,
          label: params.data.label,
          severity: params.data.severity,
          notes: params.data.notes ?? null,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({
          id: patientClinicalAlerts.id,
          clinicId: patientClinicalAlerts.clinicId,
          patientId: patientClinicalAlerts.patientId,
          kind: patientClinicalAlerts.kind,
          label: patientClinicalAlerts.label,
          severity: patientClinicalAlerts.severity,
          notes: patientClinicalAlerts.notes,
          createdAt: patientClinicalAlerts.createdAt,
          updatedAt: patientClinicalAlerts.updatedAt,
        })

      if (!row) {
        throw new Error("Failed to create clinical alert")
      }

      return toClinicalAlert(row)
    })
  },

  async softDelete(params: {
    id: string
    clinicId: string
    updatedBy: string
  }): Promise<void> {
    return withDbError(async () => {
      const [row] = await db
        .update(patientClinicalAlerts)
        .set({
          deletedAt: new Date(),
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(patientClinicalAlerts.id, params.id),
            eq(patientClinicalAlerts.clinicId, params.clinicId),
            isNull(patientClinicalAlerts.deletedAt),
          ),
        )
        .returning({ id: patientClinicalAlerts.id })

      if (!row) {
        throw new Error("Failed to delete clinical alert")
      }
    })
  },
}
