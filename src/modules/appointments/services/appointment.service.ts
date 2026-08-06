import { Permission } from "@/config/permissions"
import { logger } from "@/core/logger"
import { publishClinicOps } from "@/core/realtime"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import {
  canCompleteAttendance,
  canConfirmAppointment,
  canMarkAppointmentNoShow,
  canRoleStartAttendance,
  canStartAttendance,
  isAppointmentConfirmableInBatch,
  isAppointmentScheduleEditable,
  isSelfScheduleOnlyRole,
} from "@/modules/appointments/constants/appointments"
import type { CancelAppointmentDto } from "@/modules/appointments/dto/cancel-appointment.dto"
import type { ConfirmAppointmentsBatchDto } from "@/modules/appointments/dto/confirm-appointments-batch.dto"
import type { CountAppointmentsDto } from "@/modules/appointments/dto/count-appointments.dto"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import type { ListAppointmentsDto } from "@/modules/appointments/dto/list-appointments.dto"
import type { ListPatientAppointmentsDto } from "@/modules/appointments/dto/list-patient-appointments.dto"
import type { RescheduleAppointmentDto } from "@/modules/appointments/dto/reschedule-appointment.dto"
import type { UpdateAppointmentDetailsDto } from "@/modules/appointments/dto/update-appointment-details.dto"
import type { UpdateAppointmentStatusDto } from "@/modules/appointments/dto/update-appointment-status.dto"
import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository"
import { professionalAvailabilityService } from "@/modules/appointments/services/professional-availability.service"
import type {
  Appointment,
  ConfirmAppointmentsBatchResult,
} from "@/modules/appointments/types/appointment"
import {
  type AuthContextWithClinic,
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import { chargeService } from "@/modules/billing/services/charge.service"
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
    reason: appointment.reason,
    notes: appointment.notes,
    canceledReason: appointment.canceledReason,
  }
}

function assertScheduleEditable(appointment: Appointment): void {
  if (!isAppointmentScheduleEditable(appointment.status)) {
    throw new AppError(ErrorCode.CONFLICT, {
      message:
        "Este agendamento não pode ser alterado no status atual.",
    })
  }
}

async function assertActiveProfessionalInClinic(
  professionalId: string,
  clinicId: string,
): Promise<void> {
  const affiliation = await appointmentRepository.findProfessionalAffiliation(
    professionalId,
    clinicId,
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

    const professionalIds = isSelfScheduleOnlyRole(auth.membership.roleKey)
      ? [await resolveOwnProfessionalId(auth)]
      : filters.professionalIds?.length
        ? filters.professionalIds
        : undefined

    return appointmentRepository.listByRange({
      clinicId: auth.clinicId,
      from: filters.from,
      to: filters.to,
      professionalIds,
      patientIds: filters.patientIds?.length ? filters.patientIds : undefined,
      modality: filters.modality,
    })
  },

  async countInRange(
    filters: CountAppointmentsDto,
    ctx: AuthRequestContext,
  ): Promise<number> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    )

    const professionalIds = isSelfScheduleOnlyRole(auth.membership.roleKey)
      ? [await resolveOwnProfessionalId(auth)]
      : undefined

    return appointmentRepository.countInRange({
      clinicId: auth.clinicId,
      from: filters.from,
      to: filters.to,
      professionalIds,
      excludeStatuses: filters.excludeCanceled ? ["canceled"] : undefined,
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
   * Recent appointments for a patient in the clinic (attendance / chart context).
   * Not scoped to self-schedule — clinical history needs the full patient timeline.
   */
  async listByPatient(
    filters: ListPatientAppointmentsDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment[]> {
    const auth = await requireAnyPermission(
      ctx,
      ...APPOINTMENTS_ANY_PERMISSION,
    )

    const exists = await appointmentRepository.patientExists(
      filters.patientId,
      auth.clinicId,
    )
    if (!exists) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    return appointmentRepository.listByPatient({
      clinicId: auth.clinicId,
      patientId: filters.patientId,
      excludeAppointmentId: filters.excludeAppointmentId,
      limit: filters.limit,
    })
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

      await assertActiveProfessionalInClinic(
        data.professionalId,
        auth.clinicId,
      )

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

      await chargeService.createFromBooking(
        {
          appointmentId: appointment.id,
          serviceId: data.serviceId,
          discountPercent: data.discountPercent,
          billingKind: data.billingKind,
          amountCentsOverride: data.amountCentsOverride,
        },
        ctx,
      )

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointment.id,
        changes: { after: appointmentSnapshot(appointment) },
      })

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "appointment.created",
        entityType: "appointment",
        entityId: appointment.id,
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

      try {
        await chargeService.cancelPendingForAppointment({
          appointmentId: appointment.id,
          clinicId: auth.clinicId,
          canceledBy: auth.user.id,
          actor,
        })
      } catch (error) {
        logger.error(
          { error, appointmentId: appointment.id },
          "Failed to cancel pending charge after appointment cancel",
        )
      }

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

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "appointment.canceled",
        entityType: "appointment",
        entityId: appointment.id,
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

  async reschedule(
    data: RescheduleAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_UPDATE)
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
        const ownProfessionalId = await resolveOwnProfessionalId(auth)
        assertOwnsAppointment(existing, ownProfessionalId)
        if (data.professionalId !== ownProfessionalId) {
          throw new AppError(ErrorCode.FORBIDDEN, {
            message: "Você só pode remarcar agendamentos para si mesmo.",
          })
        }
      }

      assertScheduleEditable(existing)

      await assertActiveProfessionalInClinic(
        data.professionalId,
        auth.clinicId,
      )

      await professionalAvailabilityService.ensureAvailable({
        clinicId: auth.clinicId,
        professionalId: data.professionalId,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        excludeAppointmentId: data.id,
      })

      const appointment = await appointmentRepository.reschedule({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        professionalId: data.professionalId,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_RESCHEDULE,
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
        action: AUDIT_ACTIONS.APPOINTMENT_RESCHEDULE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: data.id,
        changes: { before: appointmentSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async updateDetails(
    data: UpdateAppointmentDetailsDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_UPDATE)
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

      assertScheduleEditable(existing)

      const appointment = await appointmentRepository.updateDetails({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        type: data.type,
        reason: data.reason ?? null,
        notes: data.notes ?? null,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_UPDATE,
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
        action: AUDIT_ACTIONS.APPOINTMENT_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: data.id,
        changes: { before: appointmentSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async updateStatus(
    data: UpdateAppointmentStatusDto,
    ctx: AuthRequestContext,
  ): Promise<Appointment> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_UPDATE)
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

      if (data.status === "confirmed") {
        if (!canConfirmAppointment(existing.status)) {
          throw new AppError(ErrorCode.CONFLICT, {
            message:
              existing.status === "confirmed"
                ? "Este agendamento já está confirmado."
                : "Este agendamento não pode ser confirmado no status atual.",
          })
        }
      } else if (data.status === "no_show") {
        if (!canMarkAppointmentNoShow(existing.status)) {
          throw new AppError(ErrorCode.CONFLICT, {
            message:
              "Não é possível marcar falta neste status do agendamento.",
          })
        }
      } else if (data.status === "checked_in") {
        if (!canRoleStartAttendance(auth.membership.roleKey)) {
          throw new AppError(ErrorCode.FORBIDDEN, {
            message:
              "Apenas profissionais de saúde, administradores e proprietários podem iniciar atendimentos.",
          })
        }
        if (!canStartAttendance(existing.status)) {
          throw new AppError(ErrorCode.CONFLICT, {
            message:
              existing.status === "checked_in"
                ? "Este atendimento já foi iniciado."
                : "Não é possível iniciar o atendimento neste status.",
          })
        }
      } else if (data.status === "completed") {
        if (!canCompleteAttendance(existing.status)) {
          throw new AppError(ErrorCode.CONFLICT, {
            message:
              "Só é possível concluir um atendimento em andamento.",
          })
        }
      } else {
        throw new AppError(ErrorCode.VALIDATION_FAILED, {
          message: "Transição de status não suportada.",
        })
      }

      const appointment = await appointmentRepository.updateStatus({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        status: data.status,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_STATUS_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: appointment.id,
        changes: {
          before: appointmentSnapshot(existing),
          after: appointmentSnapshot(appointment),
        },
      })

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "appointment.updated",
        entityType: "appointment",
        entityId: appointment.id,
      })

      return appointment
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.APPOINTMENT_STATUS_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
        entityId: data.id,
        changes: { before: appointmentSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  /**
   * Bulk confirm for the reception day board. Only `scheduled` appointments
   * transition to `confirmed`; everything else is silently skipped so the
   * caller can select a broad set (e.g. "confirm all today") safely.
   */
  async confirmBatch(
    data: ConfirmAppointmentsBatchDto,
    ctx: AuthRequestContext,
  ): Promise<ConfirmAppointmentsBatchResult> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_UPDATE)
    const actor = auditActorFromAuth(auth)

    const ownProfessionalId = isSelfScheduleOnlyRole(auth.membership.roleKey)
      ? await resolveOwnProfessionalId(auth)
      : null

    let confirmedCount = 0
    let skippedCount = 0
    const confirmedIds: string[] = []

    for (const id of data.appointmentIds) {
      const existing = await appointmentRepository.findById(id, auth.clinicId)
      if (
        !existing ||
        !isAppointmentConfirmableInBatch({
          status: existing.status,
          professionalId: existing.professionalId,
          ownProfessionalId,
        })
      ) {
        skippedCount += 1
        continue
      }

      await appointmentRepository.updateStatus({
        id: existing.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        status: "confirmed",
      })
      confirmedIds.push(existing.id)
      confirmedCount += 1
    }

    recordAudit({
      ...actor,
      action: AUDIT_ACTIONS.APPOINTMENT_BATCH_CONFIRM,
      status: "success",
      entityType: AUDIT_ENTITY_TYPES.APPOINTMENT,
      changes: {
        after: {
          requested: data.appointmentIds.length,
          confirmedCount,
          skippedCount,
          confirmedIds,
        },
      },
    })

    for (const id of confirmedIds) {
      publishClinicOps({
        clinicId: auth.clinicId,
        type: "appointment.updated",
        entityType: "appointment",
        entityId: id,
      })
    }

    return { confirmedCount, skippedCount }
  },
}
