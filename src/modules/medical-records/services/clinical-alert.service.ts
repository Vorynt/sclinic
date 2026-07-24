import { Permission } from "@/config/permissions"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import type { CreateClinicalAlertDto } from "@/modules/medical-records/dto/create-clinical-alert.dto"
import type { DeleteClinicalAlertDto } from "@/modules/medical-records/dto/delete-clinical-alert.dto"
import type { ListClinicalAlertsDto } from "@/modules/medical-records/dto/list-clinical-alerts.dto"
import { clinicalAlertRepository } from "@/modules/medical-records/repositories/clinical-alert.repository"
import type { ClinicalAlert } from "@/modules/medical-records/types/clinical-alert"
import { patientService } from "@/modules/patients/services/patient.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

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
    await patientService.getById(data.patientId, ctx)

    return clinicalAlertRepository.create({
      clinicId: auth.clinicId,
      createdBy: auth.user.id,
      data,
    })
  },

  async softDelete(
    data: DeleteClinicalAlertDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const existing = await clinicalAlertRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Alerta clínico não encontrado.",
      })
    }

    await clinicalAlertRepository.softDelete({
      id: data.id,
      clinicId: auth.clinicId,
      updatedBy: auth.user.id,
    })
  },
}
