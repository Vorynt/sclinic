import { Permission } from "@/config/permissions"
import { hasAnyPermission } from "@/core/permissions"
import { publishClinicOps } from "@/core/realtime"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import {
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards"
import type { CancelChargeDto } from "@/modules/billing/dto/cancel-charge.dto"
import type { CreateChargeFromAppointmentDto } from "@/modules/billing/dto/create-charge-from-appointment.dto"
import type { ListChargesDto } from "@/modules/billing/dto/list-charges.dto"
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto"
import { chargeRepository } from "@/modules/billing/repositories/charge.repository"
import { clinicServiceRepository } from "@/modules/billing/repositories/clinic-service.repository"
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
import { computeChargeAmountCents } from "@/modules/billing/utils/charge-pricing"
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
    serviceId: charge.serviceId,
    serviceName: charge.serviceName,
    listAmountCents: charge.listAmountCents,
    discountPercent: charge.discountPercent,
    amountCents: charge.amountCents,
    billingKind: charge.billingKind,
    status: charge.status,
    description: charge.description,
  }
}

async function createChargeFromCatalog(
  data: CreateChargeFromAppointmentDto,
  params: {
    clinicId: string
    userId: string
    actor: ReturnType<typeof auditActorFromAuth>
  },
): Promise<Charge> {
  const appointment = await chargeRepository.findAppointmentContext(
    data.appointmentId,
    params.clinicId,
  )
  if (!appointment) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Agendamento não encontrado.",
    })
  }

  assertAppointmentChargeable(appointment.status)

  const service = await clinicServiceRepository.findActiveById(
    data.serviceId,
    params.clinicId,
  )
  if (!service) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      message: "Serviço não encontrado ou inativo.",
    })
  }

  const existing = await chargeRepository.findActiveByAppointment(
    data.appointmentId,
    params.clinicId,
  )
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Já existe uma cobrança ativa para este agendamento.",
    })
  }

  const billingKind = data.billingKind
  const discountPercent =
    billingKind === "standard" ? data.discountPercent : 0
  const amountCents = computeChargeAmountCents({
    listAmountCents: service.priceCents,
    discountPercent,
    billingKind,
    amountCentsOverride: data.amountCentsOverride,
  })
  const isComplimentary =
    billingKind === "courtesy" || billingKind === "return"

  try {
    const charge = await chargeRepository.create({
      clinicId: params.clinicId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      serviceId: service.id,
      serviceName: service.name,
      listAmountCents: service.priceCents,
      discountPercent,
      amountCents,
      billingKind,
      status: isComplimentary ? "paid" : "pending",
      description: data.description,
      createdBy: params.userId,
    })

    if (isComplimentary) {
      await chargeRepository.markPaid({
        chargeId: charge.id,
        clinicId: params.clinicId,
        amountCents: 0,
        method: "courtesy",
        paidAt: new Date(),
        notes:
          billingKind === "return"
            ? "Retorno sem cobrança"
            : "Cortesia sem cobrança",
        recordedBy: params.userId,
      })
    }

    const settled = isComplimentary
      ? ((await chargeRepository.findById(charge.id, params.clinicId)) ??
        charge)
      : charge

    recordAudit({
      ...params.actor,
      action: AUDIT_ACTIONS.CHARGE_CREATE,
      status: "success",
      entityType: AUDIT_ENTITY_TYPES.CHARGE,
      entityId: settled.id,
      changes: { after: chargeSnapshot(settled) },
    })

    publishClinicOps({
      clinicId: params.clinicId,
      type: "charge.created",
      entityType: "charge",
      entityId: settled.id,
    })

    return settled
  } catch (error) {
    recordAudit({
      ...params.actor,
      action: AUDIT_ACTIONS.CHARGE_CREATE,
      status: "error",
      entityType: AUDIT_ENTITY_TYPES.CHARGE,
      changes: {
        after: {
          appointmentId: data.appointmentId,
          serviceId: data.serviceId,
          billingKind: data.billingKind,
        },
      },
      ...auditErrorFields(error),
    })
    rethrowAsConflict(error)
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

  async listActiveByAppointmentIds(
    appointmentIds: string[],
    ctx: AuthRequestContext,
  ): Promise<Charge[]> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_VIEW_OR_COLLECT)
    return chargeRepository.findActiveByAppointmentIds(
      appointmentIds,
      auth.clinicId,
    )
  },

  async getSummary(ctx: AuthRequestContext): Promise<BillingSummary> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    return chargeRepository.getSummary(auth.clinicId)
  },

  /**
   * Side effect of appointment create (ADR-009).
   * Catalog default (standard, 0%) does not require financial.collect —
   * discount / courtesy / override still enforce financial permissions.
   */
  async createFromBooking(
    data: CreateChargeFromAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Charge> {
    const auth = await requirePermission(ctx, Permission.APPOINTMENTS_CREATE)
    const actor = auditActorFromAuth(auth)

    const canCollect = hasAnyPermission(auth.permissions, [
      ...FINANCIAL_COLLECT_OR_MANAGE,
    ])
    const canManage = hasAnyPermission(auth.permissions, [
      Permission.FINANCIAL_MANAGE,
    ])

    const billingKind = canCollect ? data.billingKind : "standard"
    const discountPercent =
      canCollect && billingKind === "standard" ? data.discountPercent : 0
    const amountCentsOverride = canManage
      ? data.amountCentsOverride
      : undefined

    if (
      (data.billingKind !== "standard" || data.discountPercent > 0) &&
      !canCollect
    ) {
      throw new AppError(ErrorCode.FORBIDDEN, {
        message:
          "Você não tem permissão para definir desconto ou cortesia neste agendamento.",
      })
    }
    if (data.amountCentsOverride !== undefined && !canManage) {
      throw new AppError(ErrorCode.FORBIDDEN, {
        message: "Somente gestores financeiros podem alterar o valor final.",
      })
    }

    return createChargeFromCatalog(
      {
        ...data,
        billingKind,
        discountPercent,
        amountCentsOverride,
      },
      {
        clinicId: auth.clinicId,
        userId: auth.user.id,
        actor,
      },
    )
  },

  /**
   * Creates a charge from catalog pricing (ADR-009).
   * Public path — requires financial.collect | manage.
   */
  async createFromAppointment(
    data: CreateChargeFromAppointmentDto,
    ctx: AuthRequestContext,
  ): Promise<Charge> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_COLLECT_OR_MANAGE)
    const actor = auditActorFromAuth(auth)

    const canManage = hasAnyPermission(auth.permissions, [
      Permission.FINANCIAL_MANAGE,
    ])
    if (data.amountCentsOverride !== undefined && !canManage) {
      throw new AppError(ErrorCode.FORBIDDEN, {
        message: "Somente gestores financeiros podem alterar o valor final.",
      })
    }

    return createChargeFromCatalog(data, {
      clinicId: auth.clinicId,
      userId: auth.user.id,
      actor,
    })
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

    if (
      existing.billingKind === "courtesy" ||
      existing.billingKind === "return"
    ) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Cobrança de cortesia/retorno já está liquidada.",
      })
    }

    const canManage = hasAnyPermission(auth.permissions, [
      Permission.FINANCIAL_MANAGE,
    ])
    if (data.amountCentsOverride !== undefined && !canManage) {
      throw new AppError(ErrorCode.FORBIDDEN, {
        message: "Somente gestores financeiros podem alterar o valor final.",
      })
    }

    const listAmountCents = existing.listAmountCents ?? existing.amountCents
    const discountPercent = data.discountPercent ?? existing.discountPercent
    const amountCents = computeChargeAmountCents({
      listAmountCents,
      discountPercent,
      billingKind: "standard",
      amountCentsOverride: data.amountCentsOverride,
    })

    try {
      if (
        discountPercent !== existing.discountPercent ||
        amountCents !== existing.amountCents
      ) {
        await chargeRepository.updatePricing({
          chargeId: existing.id,
          clinicId: auth.clinicId,
          discountPercent,
          amountCents,
          updatedBy: auth.user.id,
        })
      }

      const { charge } = await chargeRepository.markPaid({
        chargeId: existing.id,
        clinicId: auth.clinicId,
        amountCents,
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

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "charge.updated",
        entityType: "charge",
        entityId: charge.id,
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

  /**
   * Side effect of appointment cancel — does not require financial.collect.
   * Caller must already have authorized the appointment cancel in-clinic.
   */
  async cancelPendingForAppointment(params: {
    appointmentId: string
    clinicId: string
    canceledBy: string
    actor: ReturnType<typeof auditActorFromAuth>
  }): Promise<Charge | null> {
    const existing = await chargeRepository.findActiveByAppointment(
      params.appointmentId,
      params.clinicId,
    )
    if (!existing || existing.status !== "pending") {
      return null
    }

    const charge = await chargeRepository.cancel({
      chargeId: existing.id,
      clinicId: params.clinicId,
      updatedBy: params.canceledBy,
    })

    recordAudit({
      ...params.actor,
      action: AUDIT_ACTIONS.CHARGE_CANCEL,
      status: "success",
      entityType: AUDIT_ENTITY_TYPES.CHARGE,
      entityId: charge.id,
      changes: {
        before: chargeSnapshot(existing),
        after: {
          ...chargeSnapshot(charge),
          reason: "appointment_canceled",
        },
      },
    })

    publishClinicOps({
      clinicId: params.clinicId,
      type: "charge.canceled",
      entityType: "charge",
      entityId: charge.id,
    })

    return charge
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

      publishClinicOps({
        clinicId: auth.clinicId,
        type: "charge.canceled",
        entityType: "charge",
        entityId: charge.id,
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
