import { Permission } from "@/config/permissions"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
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
import { canEditVitalSigns } from "@/modules/medical-records/constants/vital-signs"
import type { ListPatientVitalSignsDto } from "@/modules/medical-records/dto/list-patient-vital-signs.dto"
import type { UpsertVitalSignsDto } from "@/modules/medical-records/dto/upsert-vital-signs.dto"
import { vitalSignsRepository } from "@/modules/medical-records/repositories/vital-signs.repository"
import type {
  VitalSigns,
  VitalSignsForAppointment,
} from "@/modules/medical-records/types/vital-signs"
import { patientService } from "@/modules/patients/services/patient.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

function vitalsAuditSnapshot(vitals: VitalSigns) {
  return {
    id: vitals.id,
    appointmentId: vitals.appointmentId,
    patientId: vitals.patientId,
    systolicMmHg: vitals.systolicMmHg,
    diastolicMmHg: vitals.diastolicMmHg,
    heartRateBpm: vitals.heartRateBpm,
    temperatureC: vitals.temperatureC,
    weightKg: vitals.weightKg,
    heightCm: vitals.heightCm,
    spo2Percent: vitals.spo2Percent,
  }
}

export const vitalSignsService = {
  async getForAppointment(
    appointmentId: string,
    ctx: AuthRequestContext,
  ): Promise<VitalSignsForAppointment> {
    await requirePermission(ctx, Permission.RECORDS_READ)
    const appointment = await appointmentService.getById(appointmentId, ctx)
    const vitals = await vitalSignsRepository.findByAppointmentId(
      appointmentId,
      appointment.clinicId,
    )

    return {
      vitals,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      editable: canEditVitalSigns(appointment.status),
    }
  },

  async listPatientHistory(
    data: ListPatientVitalSignsDto,
    ctx: AuthRequestContext,
  ): Promise<VitalSigns[]> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    await patientService.getById(data.patientId, ctx)

    return vitalSignsRepository.listByPatient({
      clinicId: auth.clinicId,
      patientId: data.patientId,
      excludeAppointmentId: data.excludeAppointmentId,
    })
  },

  async upsert(
    data: UpsertVitalSignsDto,
    ctx: AuthRequestContext,
  ): Promise<VitalSigns> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditVitalSigns(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar sinais vitais enquanto o atendimento está em andamento.",
      })
    }

    const { appointmentId: _appointmentId, ...fields } = data
    const existing = await vitalSignsRepository.findByAppointmentId(
      appointment.id,
      auth.clinicId,
    )

    try {
      const vitals = existing
        ? await vitalSignsRepository.update({
            id: existing.id,
            clinicId: auth.clinicId,
            appointmentId: appointment.id,
            professionalId: appointment.professionalId,
            updatedBy: auth.user.id,
            data: fields,
          })
        : await vitalSignsRepository.create({
            clinicId: auth.clinicId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            professionalId: appointment.professionalId,
            createdBy: auth.user.id,
            data: fields,
          })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.VITAL_SIGNS_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.VITAL_SIGNS,
        entityId: vitals.id,
        changes: {
          before: existing ? vitalsAuditSnapshot(existing) : undefined,
          after: vitalsAuditSnapshot(vitals),
        },
      })

      return vitals
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.VITAL_SIGNS_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.VITAL_SIGNS,
        entityId: existing?.id,
        changes: {
          before: existing ? vitalsAuditSnapshot(existing) : undefined,
          after: { appointmentId: appointment.id, ...fields },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
