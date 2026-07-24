import { Permission } from "@/config/permissions"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { canEditClinicalNote } from "@/modules/medical-records/constants/clinical-notes"
import type { ListPatientClinicalNotesDto } from "@/modules/medical-records/dto/list-patient-clinical-notes.dto"
import type { UpsertClinicalNoteDto } from "@/modules/medical-records/dto/upsert-clinical-note.dto"
import { clinicalNoteRepository } from "@/modules/medical-records/repositories/clinical-note.repository"
import type {
  ClinicalNote,
  ClinicalNoteForAppointment,
} from "@/modules/medical-records/types/clinical-note"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

export const clinicalNoteService = {
  async getForAppointment(
    appointmentId: string,
    ctx: AuthRequestContext,
  ): Promise<ClinicalNoteForAppointment> {
    await requirePermission(ctx, Permission.RECORDS_READ)
    const appointment = await appointmentService.getById(appointmentId, ctx)
    const note = await clinicalNoteRepository.findByAppointmentId(
      appointmentId,
      appointment.clinicId,
    )

    return {
      note,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      editable: canEditClinicalNote(appointment.status),
    }
  },

  async listPatientHistory(
    data: ListPatientClinicalNotesDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicalNote[]> {
    await requirePermission(ctx, Permission.RECORDS_READ)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    return clinicalNoteRepository.listByPatient({
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      excludeAppointmentId: appointment.id,
    })
  },

  async upsert(
    data: UpsertClinicalNoteDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicalNote> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditClinicalNote(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar anotações enquanto o atendimento está em andamento.",
      })
    }

    const existing = await clinicalNoteRepository.findByAppointmentId(
      appointment.id,
      auth.clinicId,
    )

    if (existing) {
      return clinicalNoteRepository.update({
        id: existing.id,
        clinicId: auth.clinicId,
        professionalId: appointment.professionalId,
        content: data.content,
        plainText: data.plainText,
        updatedBy: auth.user.id,
      })
    }

    return clinicalNoteRepository.create({
      clinicId: auth.clinicId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      content: data.content,
      plainText: data.plainText,
      createdBy: auth.user.id,
    })
  },
}
