import { and, count, desc, eq, ilike, isNull, sql, sum } from "drizzle-orm"

import { db } from "@/db"
import { appointments, charges, patients, payments } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toCharge,
  toChargeListItem,
  toPayment,
} from "@/modules/billing/mappers/charge.mapper"
import type {
  BillingSummary,
  Charge,
  ChargeListItem,
  ChargeStatus,
  ManualPaymentMethod,
  Payment,
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

  async create(params: {
    clinicId: string
    patientId: string
    appointmentId: string
    amountCents: number
    description?: string
    createdBy: string
  }): Promise<Charge> {
    return withDbError(async () => {
      const [row] = await db
        .insert(charges)
        .values({
          clinicId: params.clinicId,
          patientId: params.patientId,
          appointmentId: params.appointmentId,
          amountCents: params.amountCents,
          currency: "BRL",
          status: "pending",
          description: params.description ?? null,
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

  async listByClinic(params: {
    clinicId: string
    q?: string
    status?: ChargeStatus
    page: number
    pageSize: number
  }): Promise<PaginatedResult<ChargeListItem>> {
    return withDbError(async () => {
      const where = and(
        eq(charges.clinicId, params.clinicId),
        isNull(charges.deletedAt),
        params.status ? eq(charges.status, params.status) : undefined,
        params.q ? ilike(patients.fullName, `%${params.q}%`) : undefined,
      )

      const offset = (params.page - 1) * params.pageSize

      const [totalRow, rows] = await Promise.all([
        db
          .select({ total: count() })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .where(where),
        db
          .select({
            charge: charges,
            patientName: patients.fullName,
            appointmentStartsAt: appointments.startsAt,
          })
          .from(charges)
          .innerJoin(patients, eq(charges.patientId, patients.id))
          .innerJoin(appointments, eq(charges.appointmentId, appointments.id))
          .where(where)
          .orderBy(desc(charges.createdAt))
          .limit(params.pageSize)
          .offset(offset),
      ])

      return toPaginatedResult({
        items: rows.map((row) =>
          toChargeListItem({
            row: row.charge,
            patientName: row.patientName,
            appointmentStartsAt: row.appointmentStartsAt,
          }),
        ),
        total: totalRow[0]?.total ?? 0,
        page: params.page,
        pageSize: params.pageSize,
      })
    })
  },

  async markPaid(params: {
    chargeId: string
    clinicId: string
    amountCents: number
    method: ManualPaymentMethod
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
}
