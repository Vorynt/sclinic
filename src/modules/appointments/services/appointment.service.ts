import { Permission } from "@/config/permissions"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments"
import type { CancelAppointmentDto } from "@/modules/appointments/dto/cancel-appointment.dto"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import type { ListAppointmentsDto } from "@/modules/appointments/dto/list-appointments.dto"
import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository"
import { professionalAvailabilityService } from "@/modules/appointments/services/professional-availability.service"
import type { Appointment } from "@/modules/appointments/types/appointment"
import {
  type AuthContextWithClinic,
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

const APPOINTMENTS_ANY_PERMISSION = [
  Permission.APPOINTMENTS_CREATE,
  Permission.APPOINTMENTS_UPDATE,
  Permission.APPOINTMENTS_DELETE,
] as const

async function resolveOwnProfessionalId(
  auth: AuthContextWithClinic,
): Promise<string> {
  const ownProfessionalId =
    await appointmentRepository.findActiveProfessionalIdByUserId(
      auth.user.id,
      auth.clinicId,
    )
  if (!ownProfessionalId) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "Seu perfil profissional não está vinculado a esta clínica.",
    })
  }
  return ownProfessionalId
}

function assertOwnsAppointment(
  appointment: Appointment,
  professionalId: string,
): void {
  if (appointment.professionalId !== professionalId) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Agendamento não encontrado.",
    })
  }
}

function appointmentSnapshot(appointment: Appointment) {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    professionalId: appointment.professionalId,
    professionalName: appointment.professionalName,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    type: appointment.type,
    status: appointment.status,
    canceledReason: appointment.canceledReason,
  }
}

export const appointmentService = {
  async list(
    filters: ListAppointmentsDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment[]> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    )

    const professionalId = isSelfScheduleOnlyRole(auth.membership.roleKey)
      ? await resolveOwnProfessionalId(auth)
      : undefined

    return appointmentRepository.listByRange({
      clinicId: auth.clinicId,
      from: filters.from,
      to: filters.to,
      professionalId,
    })
  },

  async getById(id: string, ctx: AuthRequestContext): Promise<Appointment> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    )

    const appointment = await appointmentRepository.findById(id, auth.clinicId)
    if (!appointment) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      })
    }

    if (isSelfScheduleOnlyRole(auth.membership.roleKey)) {
      assertOwnsAppointment(appointment, await resolveOwnProfessionalId(auth))
    }

    return appointment
  },

  /**
   * Clinic hours for the calendar grid (same fallback as availability checks).
   */
  async getCalendarHours(ctx: AuthRequestContext): Promise<ClinicWeeklyHours> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    )
    const { weeklyHours } = await clinicHoursService.getAvailabilityContext(
      auth.clinicId,
    )
    return weeklyHours
  },

  async create(
    data: CreateAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_CREATE)
    const actor = auditActorFromAuth(auth)

    try {
      if (isSelfScheduleOnlyRole(auth.membership.roleKey)) {
        const ownProfessionalId = await resolveOwnProfessionalId(auth)
        if (data.professionalId !== ownProfessionalId) {
          throw new AppError(ErrorCode.FORBIDDEN, {
            message: "Você só pode criar agendamentos para si mesmo.",
          })
        }
      }

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

      const appointment = await appointmentRepository.create({
        clinicId: auth.clinicId,
        createdBy: auth.user.id,
        data,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointment.id,
        changes: { after: appointmentSnapshot(appointment) },
      })

      return appointment
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        changes: {
          after: {
            patientId: data.patientId,
            professionalId: data.professionalId,
            startsAt: data.startsAt.toISOString(),
            endsAt: data.endsAt.toISOString(),
            type: data.type,
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
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
    const actor = auditActorFromAuth(auth)

    const existing = await appointmentRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      })
    }

    try {
      if (isSelfScheduleOnlyRole(auth.membership.roleKey)) {
        assertOwnsAppointment(existing, await resolveOwnProfessionalId(auth))
      }

      if (existing.status === "canceled") {
        throw new AppError(ErrorCode.CONFLICT, {
          message: "Este agendamento já foi cancelado.",
        })
      }

      const appointment = await appointmentRepository.cancel({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        canceledReason: data.canceledReason ?? null,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_CANCEL,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointment.id,
        changes: {
          before: appointmentSnapshot(existing),
          after: appointmentSnapshot(appointment),
        },
      })

      return appointment
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_CANCEL,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: data.id,
        changes: { before: appointmentSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
