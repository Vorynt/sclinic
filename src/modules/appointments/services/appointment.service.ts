import { Permission } from "@/config/permissions"
import {
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import type { CancelAppointmentDto } from "@/modules/appointments/dto/cancel-appointment.dto"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import type { ListAppointmentsDto } from "@/modules/appointments/dto/list-appointments.dto"
import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository"
import { professionalAvailabilityService } from "@/modules/appointments/services/professional-availability.service"
import type { Appointment } from "@/modules/appointments/types/appointment"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

const APPOINTMENTS_ANY_PERMISSION = [
  Permission.APPOINTMENTS_CREATE,
  Permission.APPOINTMENTS_UPDATE,
  Permission.APPOINTMENTS_DELETE,
] as const

export const appointmentService = {
  async list(
    filters: ListAppointmentsDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment[]> {
    const auth = await requireAnyPermission(ctx, ...APPOINTMENTS_ANY_PERMISSION)
    return appointmentRepository.listByRange({
      clinicId: auth.clinicId,
      from: filters.from,
      to: filters.to,
    })
  },

  async getById(id: string, ctx: AuthRequestContext): Promise<Appointment> {
    const auth = await requireAnyPermission(ctx, ...APPOINTMENTS_ANY_PERMISSION)

    const appointment = await appointmentRepository.findById(id, auth.clinicId)
    if (!appointment) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      })
    }

    return appointment
  },

  async create(
    data: CreateAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_CREATE)

    const patientExists = await appointmentRepository.patientExists(
      data.patientId,
      auth.clinicId,
    )
    if (!patientExists) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    const affiliation = await appointmentRepository.findProfessionalAffiliation(
      data.professionalId,
      auth.clinicId,
    )
    if (!affiliation) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Profissional não encontrado nesta clínica.",
      })
    }
    if (
      affiliation.professionalStatus !== "active" ||
      affiliation.affiliationStatus !== "active"
    ) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Profissional inativo nesta clínica.",
      })
    }

    await professionalAvailabilityService.ensureAvailable({
      clinicId: auth.clinicId,
      professionalId: data.professionalId,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    })

    return appointmentRepository.create({
      clinicId: auth.clinicId,
      createdBy: auth.user.id,
      data,
    })
  },

  async cancel(
    data: CancelAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requireAnyPermission(
      ctx,
      Permission.APPOINTMENTS_UPDATE,
      Permission.APPOINTMENTS_DELETE,
    )

    const existing = await appointmentRepository.findById(data.id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      })
    }

    if (existing.status === "canceled") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este agendamento já foi cancelado.",
      })
    }

    return appointmentRepository.cancel({
      id: data.id,
      clinicId: auth.clinicId,
      updatedBy: auth.user.id,
      canceledReason: data.canceledReason ?? null,
    })
  },
}
