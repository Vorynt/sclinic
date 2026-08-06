import { Permission } from "@/config/permissions"
import { publishClinicOps } from "@/core/realtime"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditErrorFields, recordAudit } from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import type { CancelWaitlistDto } from "@/modules/appointments/dto/cancel-waitlist.dto"
import type { EnqueueWaitlistDto } from "@/modules/appointments/dto/enqueue-waitlist.dto"
import type { ListWaitlistDto } from "@/modules/appointments/dto/list-waitlist.dto"
import type { PromoteWaitlistDto } from "@/modules/appointments/dto/promote-waitlist.dto"
import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository"
import { waitlistRepository } from "@/modules/appointments/repositories/waitlist.repository"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { WaitlistEntry } from "@/modules/appointments/types/waitlist"
import { assertWaitlistPromotable } from "@/modules/appointments/utils/waitlist-rules"
import {
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

const APPOINTMENTS_ANY_PERMISSION = [
  Permission.APPOINTMENTS_CREATE,
  Permission.APPOINTMENTS_UPDATE,
  Permission.APPOINTMENTS_DELETE,
] as const

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

function waitlistSnapshot(entry: WaitlistEntry) {
  return {
    id: entry.id,
    patientId: entry.patientId,
    patientName: entry.patientName,
    professionalId: entry.professionalId,
    serviceId: entry.serviceId,
    status: entry.status,
    notes: entry.notes,
    promotedAppointmentId: entry.promotedAppointmentId,
  }
}

export const waitlistService = {
  async list(
    filters: ListWaitlistDto,
    ctx: AuthRequestContext,
  ): Promise<WaitlistEntry[]> {
    const auth = await requireAnyPermission(ctx, ...APPOINTMENTS_ANY_PERMISSION)
    return waitlistRepository.listByClinic({
      clinicId: auth.clinicId,
      status: filters.status,
      professionalId: filters.professionalId,
    })
  },

  async enqueue(
    data: EnqueueWaitlistDto,
    ctx: AuthRequestContext,
  ): Promise<WaitlistEntry> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_CREATE)
    const actor = auditActorFromAuth(auth)

    try {
      const patientExists = await appointmentRepository.patientExists(
        data.patientId,
        auth.clinicId,
      )
      if (!patientExists) {
        throw new AppError(ErrorCode.NOT_FOUND, {
          message: "Paciente não encontrado.",
        })
      }

      if (data.professionalId) {
        await assertActiveProfessionalInClinic(
          data.professionalId,
          auth.clinicId,
        )
      }

      const entry = await waitlistRepository.create({
        clinicId: auth.clinicId,
        createdBy: auth.user.id,
        data,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.WAITLIST_ENQUEUE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.WAITLIST,
        entityId: entry.id,
        changes: { after: waitlistSnapshot(entry) },
      })

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "waitlist.created",
        entityType: "waitlist",
        entityId: entry.id,
      })

      return entry
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.WAITLIST_ENQUEUE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.WAITLIST,
        changes: { after: { patientId: data.patientId } },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async cancel(
    data: CancelWaitlistDto,
    ctx: AuthRequestContext,
  ): Promise<WaitlistEntry> {
    const auth = await requireAnyPermission(
      ctx,
      Permission.APPOINTMENTS_UPDATE,
      Permission.APPOINTMENTS_DELETE,
    )
    const actor = auditActorFromAuth(auth)

    const existing = await waitlistRepository.findById(data.id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Item da lista de espera não encontrado.",
      })
    }
    if (existing.status !== "waiting") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este item não está mais aguardando na fila.",
      })
    }

    try {
      const canceled = await waitlistRepository.markStatus({
        id: data.id,
        clinicId: auth.clinicId,
        status: "canceled",
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.WAITLIST_CANCEL,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.WAITLIST,
        entityId: canceled.id,
        changes: {
          before: waitlistSnapshot(existing),
          after: waitlistSnapshot(canceled),
        },
      })

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "waitlist.canceled",
        entityType: "waitlist",
        entityId: canceled.id,
      })

      return canceled
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.WAITLIST_CANCEL,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.WAITLIST,
        entityId: data.id,
        changes: { before: waitlistSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  /**
   * Promotes a waiting entry: creates the appointment (full availability
   * checks via appointmentService.create) then marks the entry promoted.
   */
  async promote(
    data: PromoteWaitlistDto,
    ctx: AuthRequestContext,
  ): Promise<WaitlistEntry> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_CREATE)
    const actor = auditActorFromAuth(auth)

    const entry = await waitlistRepository.findById(
      data.waitlistId,
      auth.clinicId,
    )
    const existing = assertWaitlistPromotable({
      entry,
      appointmentPatientId: data.appointment.patientId,
    })

    try {
      const appointment = await appointmentService.create(
        data.appointment,
        ctx,
      )

      const promoted = await waitlistRepository.markStatus({
        id: existing.id,
        clinicId: auth.clinicId,
        status: "promoted",
        promotedAppointmentId: appointment.id,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.WAITLIST_PROMOTE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.WAITLIST,
        entityId: promoted.id,
        changes: {
          before: waitlistSnapshot(existing),
          after: waitlistSnapshot(promoted),
        },
      })

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "waitlist.promoted",
        entityType: "waitlist",
        entityId: promoted.id,
      })

      return promoted
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.WAITLIST_PROMOTE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.WAITLIST,
        entityId: existing.id,
        changes: { before: waitlistSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
