import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { Permission } from "@/config/permissions"
import {
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import type { CancelChargeDto } from "@/modules/billing/dto/cancel-charge.dto"
import type { CreateChargeFromAppointmentDto } from "@/modules/billing/dto/create-charge-from-appointment.dto"
import type { ListChargesDto } from "@/modules/billing/dto/list-charges.dto"
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto"
import { chargeRepository } from "@/modules/billing/repositories/charge.repository"
import type {
  BillingSummary,
  Charge,
  ChargeListItem,
} from "@/modules/billing/types/charge"
import {
  assertAppointmentChargeable,
  assertChargePendingForCancel,
  assertChargePendingForPayment,
} from "@/modules/billing/utils/charge-rules"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode, isTechnicalError } from "@/shared/errors"
import type { PaginatedResult } from "@/types/pagination"

const FINANCIAL_COLLECT_OR_MANAGE = [
  Permission.FINANCIAL_COLLECT,
  Permission.FINANCIAL_MANAGE,
] as const

const FINANCIAL_VIEW_OR_COLLECT = [
  Permission.FINANCIAL_VIEW,
  Permission.FINANCIAL_COLLECT,
  Permission.FINANCIAL_MANAGE,
] as const

function rethrowAsConflict(error: unknown): never {
  if (isTechnicalError(error) && error.code === ErrorCode.DB_UNIQUE_VIOLATION) {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Já existe uma cobrança ativa para este agendamento.",
      cause: error,
    })
  }
  throw error
}

function chargeSnapshot(charge: Charge) {
  return {
    id: charge.id,
    appointmentId: charge.appointmentId,
    patientId: charge.patientId,
    amountCents: charge.amountCents,
    status: charge.status,
    description: charge.description,
  }
}

export const chargeService = {
  async list(
    filters: ListChargesDto,
    ctx: AuthRequestContext,
  ): Promise<PaginatedResult<ChargeListItem>> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    return chargeRepository.listByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
      status: filters.status,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  },

  async getById(id: string, ctx: AuthRequestContext): Promise<Charge> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_VIEW_OR_COLLECT)
    const charge = await chargeRepository.findById(id, auth.clinicId)
    if (!charge) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Cobrança não encontrada.",
      })
    }
    return charge
  },

  async getByAppointment(
    appointmentId: string,
    ctx: AuthRequestContext,
  ): Promise<Charge | null> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_VIEW_OR_COLLECT)
    return chargeRepository.findByAppointment(appointmentId, auth.clinicId)
  },

  async getSummary(ctx: AuthRequestContext): Promise<BillingSummary> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    return chargeRepository.getSummary(auth.clinicId)
  },

  async createFromAppointment(
    data: CreateChargeFromAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Charge> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_COLLECT_OR_MANAGE)
    const actor = auditActorFromAuth(auth)

    const appointment = await chargeRepository.findAppointmentContext(
      data.appointmentId,
      auth.clinicId,
    )
    if (!appointment) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Agendamento não encontrado.",
      })
    }

    assertAppointmentChargeable(appointment.status)

    const existing = await chargeRepository.findActiveByAppointment(
      data.appointmentId,
      auth.clinicId,
    )
    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Já existe uma cobrança ativa para este agendamento.",
      })
    }

    try {
      const charge = await chargeRepository.create({
        clinicId: auth.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amountCents: data.amountCents,
        description: data.description,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CHARGE_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        entityId: charge.id,
        changes: { after: chargeSnapshot(charge) },
      })

      return charge
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CHARGE_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        changes: {
          after: {
            appointmentId: data.appointmentId,
            amountCents: data.amountCents,
          },
        },
        ...auditErrorFields(error),
      })
      rethrowAsConflict(error)
    }
  },

  async markPaid(
    data: MarkChargePaidDto,
    ctx: AuthRequestContext,
  ): Promise<Charge> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_COLLECT_OR_MANAGE)
    const actor = auditActorFromAuth(auth)

    const existing = await chargeRepository.findById(
      data.chargeId,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Cobrança não encontrada.",
      })
    }

    assertChargePendingForPayment(existing.status)

    try {
      const { charge } = await chargeRepository.markPaid({
        chargeId: existing.id,
        clinicId: auth.clinicId,
        amountCents: existing.amountCents,
        method: data.method,
        paidAt: data.paidAt ?? new Date(),
        notes: data.notes,
        recordedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CHARGE_MARK_PAID,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        entityId: charge.id,
        changes: {
          before: chargeSnapshot(existing),
          after: chargeSnapshot(charge),
        },
      })

      return charge
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CHARGE_MARK_PAID,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        entityId: existing.id,
        changes: { before: chargeSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async cancel(
    data: CancelChargeDto,
    ctx: AuthRequestContext,
  ): Promise<Charge> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_COLLECT_OR_MANAGE)
    const actor = auditActorFromAuth(auth)

    const existing = await chargeRepository.findById(
      data.chargeId,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Cobrança não encontrada.",
      })
    }

    assertChargePendingForCancel(existing.status)

    try {
      const charge = await chargeRepository.cancel({
        chargeId: existing.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CHARGE_CANCEL,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        entityId: charge.id,
        changes: {
          before: chargeSnapshot(existing),
          after: {
            ...chargeSnapshot(charge),
            reason: data.reason ?? null,
          },
        },
      })

      return charge
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CHARGE_CANCEL,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CHARGE,
        entityId: existing.id,
        changes: { before: chargeSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
