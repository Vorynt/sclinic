import { Permission } from "@/config/permissions"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import type { CreateClinicalAlertDto } from "@/modules/medical-records/dto/create-clinical-alert.dto"
import type { DeleteClinicalAlertDto } from "@/modules/medical-records/dto/delete-clinical-alert.dto"
import type { ListClinicalAlertsDto } from "@/modules/medical-records/dto/list-clinical-alerts.dto"
import { clinicalAlertRepository } from "@/modules/medical-records/repositories/clinical-alert.repository"
import type { ClinicalAlert } from "@/modules/medical-records/types/clinical-alert"
import { patientService } from "@/modules/patients/services/patient.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

function alertAuditSnapshot(alert: ClinicalAlert) {
  return {
    id: alert.id,
    patientId: alert.patientId,
    kind: alert.kind,
    label: alert.label,
    severity: alert.severity,
  }
}

export const clinicalAlertService = {
  async listByPatient(
    data: ListClinicalAlertsDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicalAlert[]> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    // Ensures patient exists in clinic (and caller has patients.read via service).
    await patientService.getById(data.patientId, ctx)

    return clinicalAlertRepository.listByPatient(
      data.patientId,
      auth.clinicId,
    )
  },

  async create(
    data: CreateClinicalAlertDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicalAlert> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    await patientService.getById(data.patientId, ctx)

    try {
      const alert = await clinicalAlertRepository.create({
        clinicId: auth.clinicId,
        createdBy: auth.user.id,
        data,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINICAL_ALERT_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINICAL_ALERT,
        entityId: alert.id,
        changes: { after: alertAuditSnapshot(alert) },
      })

      return alert
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINICAL_ALERT_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINICAL_ALERT,
        changes: {
          after: {
            patientId: data.patientId,
            kind: data.kind,
            label: data.label,
            severity: data.severity,
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async softDelete(
    data: DeleteClinicalAlertDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await clinicalAlertRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Alerta clínico não encontrado.",
      })
    }

    try {
      await clinicalAlertRepository.softDelete({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINICAL_ALERT_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINICAL_ALERT,
        entityId: data.id,
        changes: { before: alertAuditSnapshot(existing) },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINICAL_ALERT_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINICAL_ALERT,
        entityId: data.id,
        changes: { before: alertAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
