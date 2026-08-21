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
import type { ExportChargesDto } from "@/modules/billing/dto/export-charges.dto"
import type { GetBillingInsightsDto } from "@/modules/billing/dto/get-billing-insights.dto"
import type { ListChargesDto } from "@/modules/billing/dto/list-charges.dto"
import type { MarkChargePaidDto } from "@/modules/billing/dto/mark-charge-paid.dto"
import { CHARGE_EXPORT_MAX_ROWS } from "@/modules/billing/constants/charges"
import {
  chargesExportFilename,
  chargesToCsv,
} from "@/modules/billing/mappers/charges-csv"
import {
  chargeRepository,
  type ChargeQueryFilters,
} from "@/modules/billing/repositories/charge.repository"
import { clinicServiceRepository } from "@/modules/billing/repositories/clinic-service.repository"
import type {
  BillingInsights,
  BillingSummary,
  Charge,
  ChargeExportList,
  ChargeListItem,
  ChargesExport,
  DelinquentPatient,
} from "@/modules/billing/types/charge"
import { endOfClinicLocalDay } from "@/modules/billing/utils/charge-due-date"
import { resolveChargePeriod } from "@/modules/billing/utils/charge-period"
import { fillChargeInsightTimeBuckets } from "@/modules/billing/utils/fill-insight-time-buckets"
import {
  assertAppointmentChargeable,
  assertChargePendingForCancel,
  assertChargePendingForPayment,
} from "@/modules/billing/utils/charge-rules"
import { computeChargeAmountCents } from "@/modules/billing/utils/charge-pricing"
import { clinicRepository } from "@/modules/clinics/repositories/clinic.repository"
import { clinicHoursService } from "@/modules/clinics/services/clinic-hours.service"
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

type ChargeFilterInput = {
  q?: string
  status?: ChargeQueryFilters["status"]
  overdue?: boolean
  from?: string
  to?: string
  periodAll?: boolean
  serviceId?: string
  billingKind?: ChargeQueryFilters["billingKind"]
  method?: ChargeQueryFilters["method"]
  patientId?: string
}

async function resolveClinicChargeFilters(
  clinicId: string,
  filters: ChargeFilterInput,
): Promise<
  ChargeQueryFilters & {
    from: string | null
    to: string | null
    periodAll: boolean
    grain: BillingInsights["period"]["grain"]
    timeZone: string
  }
> {
  const { timeZone } = await clinicHoursService.getAvailabilityContext(clinicId)
  const period = resolveChargePeriod({
    from: filters.from,
    to: filters.to,
    periodAll: filters.periodAll,
    timeZone,
  })

  return {
    clinicId,
    q: filters.q,
    status: filters.status,
    overdue: filters.overdue,
    startsAtFrom: period.startsAtFrom,
    startsAtTo: period.startsAtTo,
    serviceId: filters.serviceId,
    billingKind: filters.billingKind,
    method: filters.method,
    patientId: filters.patientId,
    from: period.from,
    to: period.to,
    periodAll: period.periodAll,
    grain: period.grain,
    timeZone,
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

  const { timeZone } = await clinicHoursService.getAvailabilityContext(
    params.clinicId,
  )
  const dueAt = endOfClinicLocalDay(appointment.startsAt, timeZone)

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
      dueAt,
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
    const resolved = await resolveClinicChargeFilters(auth.clinicId, filters)
    return chargeRepository.listByClinic({
      ...resolved,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  },

  async listDelinquentPatients(
    ctx: AuthRequestContext,
  ): Promise<DelinquentPatient[]> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    return chargeRepository.listDelinquentPatients(auth.clinicId)
  },

  async getInsights(
    filters: GetBillingInsightsDto,
    ctx: AuthRequestContext,
  ): Promise<BillingInsights> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    const resolved = await resolveClinicChargeFilters(auth.clinicId, filters)
    const insights = await chargeRepository.getInsights(resolved)
    return {
      ...insights,
      byTime: fillChargeInsightTimeBuckets({
        rows: insights.byTime,
        from: insights.period.from,
        to: insights.period.to,
        grain: insights.period.grain,
      }),
    }
  },

  async exportCsv(
    filters: ExportChargesDto,
    ctx: AuthRequestContext,
  ): Promise<ChargesExport> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    const resolved = await resolveClinicChargeFilters(auth.clinicId, filters)
    const { items, total } = await chargeRepository.listForExport({
      ...resolved,
      limit: CHARGE_EXPORT_MAX_ROWS,
    })

    if (total > CHARGE_EXPORT_MAX_ROWS) {
      throw new AppError(ErrorCode.EXPORT_LIMIT_EXCEEDED, {
        message: `Há mais de ${CHARGE_EXPORT_MAX_ROWS} cobranças neste recorte. Refine os filtros para exportar.`,
      })
    }

    return {
      filename: chargesExportFilename({
        from: resolved.from,
        to: resolved.to,
        periodAll: resolved.periodAll,
      }),
      csv: chargesToCsv(items),
    }
  },

  async listForExport(
    filters: ExportChargesDto,
    ctx: AuthRequestContext,
  ): Promise<ChargeExportList> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_VIEW)
    const resolved = await resolveClinicChargeFilters(auth.clinicId, filters)
    const [{ items, total }, clinic] = await Promise.all([
      chargeRepository.listForExport({
        ...resolved,
        limit: CHARGE_EXPORT_MAX_ROWS,
      }),
      clinicRepository.findById(auth.clinicId),
    ])

    if (total > CHARGE_EXPORT_MAX_ROWS) {
      throw new AppError(ErrorCode.EXPORT_LIMIT_EXCEEDED, {
        message: `Há mais de ${CHARGE_EXPORT_MAX_ROWS} cobranças neste recorte. Refine os filtros para imprimir.`,
      })
    }

    return {
      clinicName: clinic?.name.trim() || "Clínica",
      items,
    }
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
