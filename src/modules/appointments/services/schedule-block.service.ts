import { Permission } from "@/config/permissions"
import { publishClinicOps } from "@/core/realtime"
import { isSelfScheduleOnlyRole } from "@/modules/appointments/constants/appointments"
import type { CreateScheduleBlockDto } from "@/modules/appointments/dto/create-schedule-block.dto"
import type { ListScheduleBlocksDto } from "@/modules/appointments/dto/list-schedule-blocks.dto"
import { appointmentRepository } from "@/modules/appointments/repositories/appointment.repository"
import { scheduleBlockRepository } from "@/modules/appointments/repositories/schedule-block.repository"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"
import {
  canCreateScheduleBlock,
  canDeleteScheduleBlock,
} from "@/modules/appointments/utils/schedule-block-access"
import {
  type AuthContextWithClinic,
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

async function resolveOwnProfessionalId(
  auth: AuthContextWithClinic,
): Promise<string | null> {
  return appointmentRepository.findActiveProfessionalIdByUserId(
    auth.user.id,
    auth.clinicId,
  )
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

export const scheduleBlockService = {
  async list(
    filters: ListScheduleBlocksDto,
    auth: AuthRequestContext,
  ): Promise<ScheduleBlock[]> {
    const ctx = await requireAnyPermission(auth, ...APPOINTMENTS_ANY_PERMISSION)

    let professionalIds = filters.professionalIds
    if (isSelfScheduleOnlyRole(ctx.membership.roleKey)) {
      const ownId = await resolveOwnProfessionalId(ctx)
      if (!ownId) {
        throw new AppError(ErrorCode.FORBIDDEN, {
          message: "Seu perfil profissional não está vinculado a esta clínica.",
        })
      }
      professionalIds = [ownId]
    }

    return scheduleBlockRepository.listByRange({
      clinicId: ctx.clinicId,
      from: filters.from,
      to: filters.to,
      professionalIds,
    })
  },

  async create(
    data: CreateScheduleBlockDto,
    auth: AuthRequestContext,
  ): Promise<ScheduleBlock> {
    const ctx = await requirePermission(auth, Permission.APPOINTMENTS_CREATE)
    const ownProfessionalId = await resolveOwnProfessionalId(ctx)

    const access = canCreateScheduleBlock({
      roleKey: ctx.membership.roleKey,
      ownProfessionalId,
      targetProfessionalId: data.professionalId,
    })
    if (!access.ok) {
      throw new AppError(ErrorCode.FORBIDDEN, { message: access.message })
    }

    if (data.professionalId) {
      await assertActiveProfessionalInClinic(data.professionalId, ctx.clinicId)
    }

    const block = await scheduleBlockRepository.create({
      clinicId: ctx.clinicId,
      createdBy: ctx.user.id,
      data,
    })

    publishClinicOps({
      clinicId: ctx.clinicId,
      type: "appointment.updated",
      entityType: "appointment",
      entityId: block.id,
    })

    return block
  },

  async remove(id: string, auth: AuthRequestContext): Promise<ScheduleBlock> {
    const ctx = await requireAnyPermission(
      auth,
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_DELETE,
    )

    const existing = await scheduleBlockRepository.findById(id, ctx.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Bloqueio não encontrado.",
      })
    }

    const ownProfessionalId = await resolveOwnProfessionalId(ctx)
    const access = canDeleteScheduleBlock({
      roleKey: ctx.membership.roleKey,
      ownProfessionalId,
      blockProfessionalId: existing.professionalId,
    })
    if (!access.ok) {
      throw new AppError(ErrorCode.FORBIDDEN, { message: access.message })
    }

    const deleted = await scheduleBlockRepository.softDelete({
      id,
      clinicId: ctx.clinicId,
      updatedBy: ctx.user.id,
    })
    if (!deleted) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Bloqueio não encontrado.",
      })
    }

    publishClinicOps({
      clinicId: ctx.clinicId,
      type: "appointment.updated",
      entityType: "appointment",
      entityId: deleted.id,
    })

    return deleted
  },
}
