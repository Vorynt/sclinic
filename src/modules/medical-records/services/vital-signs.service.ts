import { Permission } from "@/config/permissions"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
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

    if (existing) {
      return vitalSignsRepository.update({
        id: existing.id,
        clinicId: auth.clinicId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        updatedBy: auth.user.id,
        data: fields,
      })
    }

    return vitalSignsRepository.create({
      clinicId: auth.clinicId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      createdBy: auth.user.id,
      data: fields,
    })
  },
}
