import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  sql,
  sum,
} from "drizzle-orm"

import { db } from "@/db"
import { appointments, charges, patients, payments } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toCharge,
  toChargeListItem,
  toPayment,
} from "@/modules/billing/mappers/charge.mapper"
import type {
  BillingInsightGrain,
  BillingInsights,
  BillingKind,
  BillingSummary,
  Charge,
  ChargeListItem,
  ChargeStatus,
  DelinquentPatient,
  ManualPaymentMethod,
  Payment,
  PaymentMethod,
} from "@/modules/billing/types/charge"
import {
  toPaginatedResult,
  type PaginatedResult,
} from "@/types/pagination"

export type AppointmentChargeContext = {
  id: string
  clinicId: string
  patientId: string
  status: string
  startsAt: Date
}

export type ChargeQueryFilters = {
  clinicId: string
  q?: string
  status?: ChargeStatus
  overdue?: boolean
  startsAtFrom?: Date
  startsAtTo?: Date
  serviceId?: string
  billingKind?: BillingKind
  method?: PaymentMethod
  patientId?: string
}

const paymentMethodSubquery = sql<PaymentMethod | null>`(
  select ${payments.method}
  from ${payments}
  where ${payments.chargeId} = ${charges.id}
    and ${payments.deletedAt} is null
  order by ${payments.paidAt} desc
  limit 1
)`

function chargeListWhere(params: ChargeQueryFilters) {
  return and(
    eq(charges.clinicId, params.clinicId),
    isNull(charges.deletedAt),
    params.status ? eq(charges.status, params.status) : undefined,
    params.q ? ilike(patients.fullName, `%${params.q}%`) : undefined,
    params.overdue
      ? and(
          eq(charges.status, "pending"),
          sql`${charges.dueAt} is not null and ${charges.dueAt} < now()`,
        )
      : undefined,
    params.serviceId ? eq(charges.serviceId, params.serviceId) : undefined,
    params.billingKind
      ? eq(charges.billingKind, params.billingKind)
      : undefined,
    params.patientId ? eq(charges.patientId, params.patientId) : undefined,
    params.startsAtFrom
      ? gte(appointments.startsAt, params.startsAtFrom)
      : undefined,
    params.startsAtTo
      ? lte(appointments.startsAt, params.startsAtTo)
      : undefined,
    params.method
      ? sql`exists (
          select 1 from ${payments}
          where ${payments.chargeId} = ${charges.id}
            and ${payments.deletedAt} is null
            and ${payments.method} = ${params.method}
        )`
      : undefined,
  )
}

function toNumber(value: unknown): number {
  return Number(value ?? 0)
}

/** IANA tz as a SQL literal so SELECT/GROUP BY/ORDER BY stay the same expression. */
function sqlTimeZoneLiteral(timeZone: string) {
  return sql.raw(`'${timeZone.replaceAll("'", "''")}'`)
}

function appointmentBucketExpr(grain: BillingInsightGrain, timeZone: string) {
  const tz = sqlTimeZoneLiteral(timeZone)
  if (grain === "day") {
    return sql<string>`((${appointments.startsAt} at time zone ${tz})::date)::text`
  }
  return sql<string>`(date_trunc('week', ${appointments.startsAt} at time zone ${tz}))::date::text`
}

export const chargeRepository = {
  async findAppointmentContext(
    appointmentId: string,
    clinicId: string,
  ): Promise<AppointmentChargeContext | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: appointments.id,
          clinicId: appointments.clinicId,
          patientId: appointments.patientId,
          status: appointments.status,
          startsAt: appointments.startsAt,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.clinicId, clinicId),
            isNull(appointments.deletedAt),
          ),
        )
        .limit(1)

      return row ?? null
    })
  },

  async findById(id: string, clinicId: string): Promise<Charge | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(charges)
        .where(
          and(
            eq(charges.id, id),
            eq(charges.clinicId, clinicId),
            isNull(charges.deletedAt),
          ),
        )
        .limit(1)

      return row ? toCharge(row) : null
    })
  },

  async findActiveByAppointment(
    appointmentId: string,
    clinicId: string,
  ): Promise<Charge | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(charges)
        .where(
          and(
            eq(charges.appointmentId, appointmentId),
            eq(charges.clinicId, clinicId),
            isNull(charges.deletedAt),
            sql`${charges.status} <> 'canceled'`,
          ),
        )
        .limit(1)

      return row ? toCharge(row) : null
    })
  },

  async findByAppointment(
    appointmentId: string,
    clinicId: string,
  ): Promise<Charge | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(charges)
        .where(
          and(
            eq(charges.appointmentId, appointmentId),
            eq(charges.clinicId, clinicId),
            isNull(charges.deletedAt),
          ),
        )
        .orderBy(desc(charges.createdAt))
        .limit(1)

      return row ? toCharge(row) : null
    })
  },

  async findActiveByAppointmentIds(
    appointmentIds: string[],
    clinicId: string,
  ): Promise<Charge[]> {
    if (appointmentIds.length === 0) return []

    return withDbError(async () => {
      const rows = await db
        .select()
        .from(charges)
        .where(
          and(
            eq(charges.clinicId, clinicId),
            isNull(charges.deletedAt),
            inArray(charges.appointmentId, appointmentIds),
            sql`${charges.status} <> 'canceled'`,
          ),
        )

      return rows.map(toCharge)
    })
  },

  async create(params: {
    clinicId: string
    patientId: string
    appointmentId: string
    serviceId: string
    serviceName: string
    listAmountCents: number
    discountPercent: number
    amountCents: number
    billingKind: "standard" | "courtesy" | "return"
    status: "pending" | "paid"
    description?: string
    dueAt?: Date | null
    createdBy: string
  }): Promise<Charge> {
    return withDbError(async () => {
      const [row] = await db
        .insert(charges)
        .values({
          clinicId: params.clinicId,
          patientId: params.patientId,
          appointmentId: params.appointmentId,
          serviceId: params.serviceId,
          serviceName: params.serviceName,
          listAmountCents: params.listAmountCents,
          discountPercent: params.discountPercent,
          amountCents: params.amountCents,
          billingKind: params.billingKind,
          currency: "BRL",
          status: params.status,
          description: params.description ?? null,
          dueAt: params.dueAt ?? null,
          provider: "none",
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to create charge")
      }

      return toCharge(row)
    })
  },

  async updatePricing(params: {
    chargeId: string
    clinicId: string
    discountPercent: number
    amountCents: number
    updatedBy: string
  }): Promise<Charge> {
    return withDbError(async () => {
      const [row] = await db
        .update(charges)
        .set({
          discountPercent: params.discountPercent,
          amountCents: params.amountCents,
          updatedBy: params.updatedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(charges.id, params.chargeId),
            eq(charges.clinicId, params.clinicId),
            isNull(charges.deletedAt),
          ),
        )
        .returning()

      if (!row) {
        throw new Error("Failed to update charge pricing")
      }

      return toCharge(row)
    })
  },

  async listByClinic(
    params: ChargeQueryFilters & { page: number; pageSize: number },
  ): Promise<PaginatedResult<ChargeListItem>> {
    return withDbError(async () => {
      const where = chargeListWhere(params)
      const offset = (params.page - 1) * params.pageSize

      const [totalRow, rows] = await Promise.all([
        db
          .select({ total: count() })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where),
        db
          .select({
            charge: charges,
            patientName: patients.fullName,
            appointmentStartsAt: appointments.startsAt,
            paymentMethod: paymentMethodSubquery,
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where)
          .orderBy(desc(appointments.startsAt), desc(charges.createdAt))
          .limit(params.pageSize)
          .offset(offset),
      ])

      return toPaginatedResult({
        items: rows.map((row) =>
          toChargeListItem({
            row: row.charge,
            patientName: row.patientName,
            appointmentStartsAt: row.appointmentStartsAt,
            paymentMethod: row.paymentMethod,
          }),
        ),
        total: totalRow[0]?.total ?? 0,
        page: params.page,
        pageSize: params.pageSize,
      })
    })
  },

  async listForExport(
    params: ChargeQueryFilters & { limit: number },
  ): Promise<{ items: ChargeListItem[]; total: number }> {
    return withDbError(async () => {
      const where = chargeListWhere(params)

      const [totalRow, rows] = await Promise.all([
        db
          .select({ total: count() })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where),
        db
          .select({
            charge: charges,
            patientName: patients.fullName,
            appointmentStartsAt: appointments.startsAt,
            paymentMethod: paymentMethodSubquery,
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where)
          .orderBy(desc(appointments.startsAt), desc(charges.createdAt))
          .limit(params.limit),
      ])

      return {
        total: totalRow[0]?.total ?? 0,
        items: rows.map((row) =>
          toChargeListItem({
            row: row.charge,
            patientName: row.patientName,
            appointmentStartsAt: row.appointmentStartsAt,
            paymentMethod: row.paymentMethod,
          }),
        ),
      }
    })
  },

  async getInsights(
    params: ChargeQueryFilters & {
      grain: BillingInsightGrain
      timeZone: string
      from: string | null
      to: string | null
      periodAll: boolean
    },
  ): Promise<BillingInsights> {
    return withDbError(async () => {
      const where = chargeListWhere(params)
      const { grain, timeZone } = params
      const bucketExpr = appointmentBucketExpr(grain, timeZone)

      const [kpiRow, timeRows, statusRows, methodRows] = await Promise.all([
        db
          .select({
            receivedCents: sql<number>`coalesce(sum(${charges.amountCents}) filter (where ${charges.status} = 'paid'), 0)`,
            receivedCount: sql<number>`count(*) filter (where ${charges.status} = 'paid')`,
            pendingCents: sql<number>`coalesce(sum(${charges.amountCents}) filter (where ${charges.status} = 'pending'), 0)`,
            pendingCount: sql<number>`count(*) filter (where ${charges.status} = 'pending')`,
            overdueCents: sql<number>`coalesce(sum(${charges.amountCents}) filter (where ${charges.status} = 'pending' and ${charges.dueAt} is not null and ${charges.dueAt} < now()), 0)`,
            overdueCount: sql<number>`count(*) filter (where ${charges.status} = 'pending' and ${charges.dueAt} is not null and ${charges.dueAt} < now())`,
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where)
          .then((rows) => rows[0]),
        db
          .select({
            bucket: bucketExpr,
            billedCents: sum(charges.amountCents),
            receivedCents: sql<number>`coalesce(sum(${charges.amountCents}) filter (where ${charges.status} = 'paid'), 0)`,
            count: count(),
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where)
          .groupBy(sql.raw("1"))
          .orderBy(sql.raw("1")),
        db
          .select({
            status: charges.status,
            amountCents: sum(charges.amountCents),
            count: count(),
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where)
          .groupBy(charges.status),
        db
          .select({
            method: payments.method,
            amountCents: sum(payments.amountCents),
            count: count(),
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .innerJoin(
            payments,
            and(
              eq(payments.chargeId, charges.id),
              isNull(payments.deletedAt),
            ),
          )
          .where(where)
          .groupBy(payments.method),
      ])

      const receivedCents = toNumber(kpiRow?.receivedCents)
      const receivedCount = toNumber(kpiRow?.receivedCount)

      return {
        period: {
          from: params.from,
          to: params.to,
          periodAll: params.periodAll,
          grain,
          timeZone,
        },
        kpis: {
          receivedCents,
          receivedCount,
          pendingCents: toNumber(kpiRow?.pendingCents),
          pendingCount: toNumber(kpiRow?.pendingCount),
          overdueCents: toNumber(kpiRow?.overdueCents),
          overdueCount: toNumber(kpiRow?.overdueCount),
          averageTicketCents:
            receivedCount > 0 ? Math.round(receivedCents / receivedCount) : 0,
        },
        byTime: timeRows.map((row) => ({
          bucket: row.bucket,
          billedCents: toNumber(row.billedCents),
          receivedCents: toNumber(row.receivedCents),
          count: row.count,
        })),
        byStatus: statusRows.map((row) => ({
          status: row.status as ChargeStatus,
          amountCents: toNumber(row.amountCents),
          count: row.count,
        })),
        byMethod: methodRows.map((row) => ({
          method: row.method as PaymentMethod,
          amountCents: toNumber(row.amountCents),
          count: row.count,
        })),
      }
    })
  },

  async markPaid(params: {
    chargeId: string
    clinicId: string
    amountCents: number
    method: ManualPaymentMethod | "courtesy"
    paidAt: Date
    notes?: string
    recordedBy: string
  }): Promise<{ charge: Charge; payment: Payment }> {
    return withDbError(async () => {
      const [paymentRow] = await db
        .insert(payments)
        .values({
          clinicId: params.clinicId,
          chargeId: params.chargeId,
          amountCents: params.amountCents,
          method: params.method,
          paidAt: params.paidAt,
          provider: "none",
          notes: params.notes ?? null,
          recordedBy: params.recordedBy,
        })
        .returning()

      if (!paymentRow) {
        throw new Error("Failed to create payment")
      }

      const [chargeRow] = await db
        .update(charges)
        .set({
          status: "paid",
          updatedBy: params.recordedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(charges.id, params.chargeId),
            eq(charges.clinicId, params.clinicId),
            isNull(charges.deletedAt),
          ),
        )
        .returning()

      if (!chargeRow) {
        throw new Error("Failed to update charge status")
      }

      return {
        charge: toCharge(chargeRow),
        payment: toPayment(paymentRow),
      }
    })
  },

  async cancel(params: {
    chargeId: string
    clinicId: string
    updatedBy: string
  }): Promise<Charge> {
    return withDbError(async () => {
      const [row] = await db
        .update(charges)
        .set({
          status: "canceled",
          updatedBy: params.updatedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(charges.id, params.chargeId),
            eq(charges.clinicId, params.clinicId),
            isNull(charges.deletedAt),
          ),
        )
        .returning()

      if (!row) {
        throw new Error("Failed to cancel charge")
      }

      return toCharge(row)
    })
  },

  async getSummary(clinicId: string): Promise<BillingSummary> {
    return withDbError(async () => {
      const now = new Date()
      const monthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
      )

      const [pendingRow, paidRow] = await Promise.all([
        db
          .select({
            totalCents: sum(charges.amountCents),
            count: count(),
          })
          .from(charges)
          .where(
            and(
              eq(charges.clinicId, clinicId),
              isNull(charges.deletedAt),
              eq(charges.status, "pending"),
            ),
          ),
        db
          .select({
            totalCents: sum(payments.amountCents),
            count: count(),
          })
          .from(payments)
          .where(
            and(
              eq(payments.clinicId, clinicId),
              isNull(payments.deletedAt),
              sql`${payments.paidAt} >= ${monthStart}`,
            ),
          ),
      ])

      return {
        pendingTotalCents: Number(pendingRow[0]?.totalCents ?? 0),
        pendingCount: pendingRow[0]?.count ?? 0,
        paidThisMonthCents: Number(paidRow[0]?.totalCents ?? 0),
        paidThisMonthCount: paidRow[0]?.count ?? 0,
      }
    })
  },

  async listDelinquentPatients(
    clinicId: string,
  ): Promise<DelinquentPatient[]> {
    return withDbError(async () => {
      const rows = await db
        .select({
          patientId: charges.patientId,
          patientName: patients.fullName,
          totalCents: sum(charges.amountCents),
          count: count(),
          oldestDueAt: sql<Date>`min(${charges.dueAt})`,
        })
        .from(charges)
        .innerJoin(patients, eq(charges.patientId, patients.id))
        .where(
          and(
            eq(charges.clinicId, clinicId),
            isNull(charges.deletedAt),
            eq(charges.status, "pending"),
            sql`${charges.dueAt} IS NOT NULL AND ${charges.dueAt} < now()`,
          ),
        )
        .groupBy(charges.patientId, patients.fullName)
        .orderBy(sql`min(${charges.dueAt}) asc`)

      return rows.map((row) => ({
        patientId: row.patientId,
        patientName: row.patientName,
        totalCents: Number(row.totalCents ?? 0),
        count: row.count,
        oldestDueAt: row.oldestDueAt,
      }))
    })
  },
}
