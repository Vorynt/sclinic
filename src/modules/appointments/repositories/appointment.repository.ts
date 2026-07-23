import { and, asc, eq, gt, isNull, lt, ne } from "drizzle-orm"

import { db } from "@/db"
import { appointments, patients, professionalClinics, professionals } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import { toAppointment } from "@/modules/appointments/mappers/appointment.mapper"
import type { Appointment } from "@/modules/appointments/types/appointment"

const appointmentSelect = {
  id: appointments.id,
  clinicId: appointments.clinicId,
  patientId: appointments.patientId,
  patientName: patients.fullName,
  professionalId: appointments.professionalId,
  professionalName: professionals.fullName,
  startsAt: appointments.startsAt,
  endsAt: appointments.endsAt,
  type: appointments.type,
  status: appointments.status,
  reason: appointments.reason,
  notes: appointments.notes,
  canceledAt: appointments.canceledAt,
  canceledReason: appointments.canceledReason,
  createdAt: appointments.createdAt,
  updatedAt: appointments.updatedAt,
}

function appointmentJoin() {
  return db
    .select(appointmentSelect)
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .leftJoin(professionals, eq(professionals.id, appointments.professionalId))
}

export const appointmentRepository = {
  async listByRange(params: {
    clinicId: string
    from: Date
    to: Date
  }): Promise<Appointment[]> {
    return withDbError(async () => {
      const rows = await appointmentJoin()
        .where(
          and(
            eq(appointments.clinicId, params.clinicId),
            isNull(appointments.deletedAt),
            lt(appointments.startsAt, params.to),
            gt(appointments.endsAt, params.from),
          ),
        )
        .orderBy(asc(appointments.startsAt))

      return rows.map(toAppointment)
    })
  },

  async findById(id: string, clinicId: string): Promise<Appointment | null> {
    return withDbError(async () => {
      const [row] = await appointmentJoin()
        .where(
          and(
            eq(appointments.id, id),
            eq(appointments.clinicId, clinicId),
            isNull(appointments.deletedAt),
          ),
        )
        .limit(1)

      return row ? toAppointment(row) : null
    })
  },

  async patientExists(patientId: string, clinicId: string): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: patients.id })
        .from(patients)
        .where(
          and(
            eq(patients.id, patientId),
            eq(patients.clinicId, clinicId),
            isNull(patients.deletedAt),
          ),
        )
        .limit(1)

      return Boolean(row)
    })
  },

  async findProfessionalAffiliation(
    professionalId: string,
    clinicId: string,
  ): Promise<{
    professionalStatus: string
    affiliationStatus: string
  } | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          professionalStatus: professionals.status,
          affiliationStatus: professionalClinics.status,
        })
        .from(professionalClinics)
        .innerJoin(
          professionals,
          and(
            eq(professionals.id, professionalClinics.professionalId),
            isNull(professionals.deletedAt),
          ),
        )
        .where(
          and(
            eq(professionalClinics.professionalId, professionalId),
            eq(professionalClinics.clinicId, clinicId),
            isNull(professionalClinics.deletedAt),
          ),
        )
        .limit(1)

      return row ?? null
    })
  },

  /**
   * Active professional id linked to the user in this clinic, if any.
   */
  async findActiveProfessionalIdByUserId(
    userId: string,
    clinicId: string,
  ): Promise<string | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: professionals.id })
        .from(professionalClinics)
        .innerJoin(
          professionals,
          and(
            eq(professionals.id, professionalClinics.professionalId),
            isNull(professionals.deletedAt),
            eq(professionals.status, "active"),
            eq(professionals.userId, userId),
          ),
        )
        .where(
          and(
            eq(professionalClinics.clinicId, clinicId),
            eq(professionalClinics.status, "active"),
            isNull(professionalClinics.deletedAt),
          ),
        )
        .limit(1)

      return row?.id ?? null
    })
  },

  /**
   * True when the professional already has a non-canceled appointment
   * overlapping [startsAt, endsAt). Canceled (and soft-deleted) slots are ignored.
   */
  async hasOverlappingActiveAppointment(params: {
    clinicId: string
    professionalId: string
    startsAt: Date
    endsAt: Date
    excludeAppointmentId?: string
  }): Promise<boolean> {
    return withDbError(async () => {
      const [row] = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, params.clinicId),
            eq(appointments.professionalId, params.professionalId),
            isNull(appointments.deletedAt),
            ne(appointments.status, "canceled"),
            lt(appointments.startsAt, params.endsAt),
            gt(appointments.endsAt, params.startsAt),
            params.excludeAppointmentId
              ? ne(appointments.id, params.excludeAppointmentId)
              : undefined,
          ),
        )
        .limit(1)

      return Boolean(row)
    })
  },

  /**
   * Active (non-canceled) busy intervals for a professional in [from, to).
   */
  async listBusyIntervals(params: {
    clinicId: string
    professionalId: string
    from: Date
    to: Date
    excludeAppointmentId?: string
  }): Promise<{ startsAt: Date; endsAt: Date }[]> {
    return withDbError(async () => {
      return db
        .select({
          startsAt: appointments.startsAt,
          endsAt: appointments.endsAt,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, params.clinicId),
            eq(appointments.professionalId, params.professionalId),
            isNull(appointments.deletedAt),
            ne(appointments.status, "canceled"),
            lt(appointments.startsAt, params.to),
            gt(appointments.endsAt, params.from),
            params.excludeAppointmentId
              ? ne(appointments.id, params.excludeAppointmentId)
              : undefined,
          ),
        )
        .orderBy(asc(appointments.startsAt))
    })
  },

  async create(params: {
    clinicId: string
    createdBy: string
    data: CreateAppointmentDto
  }): Promise<Appointment> {
    return withDbError(async () => {
      const [row] = await db
        .insert(appointments)
        .values({
          clinicId: params.clinicId,
          patientId: params.data.patientId,
          professionalId: params.data.professionalId,
          startsAt: params.data.startsAt,
          endsAt: params.data.endsAt,
          type: params.data.type,
          reason: params.data.reason ?? null,
          notes: params.data.notes ?? null,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({ id: appointments.id })

      if (!row) {
        throw new Error("Failed to create appointment")
      }

      const created = await appointmentRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!created) {
        throw new Error("Failed to load appointment after creation")
      }

      return created
    })
  },

  async cancel(params: {
    id: string
    clinicId: string
    updatedBy: string
    canceledReason: string | null
  }): Promise<Appointment> {
    return withDbError(async () => {
      const [row] = await db
        .update(appointments)
        .set({
          status: "canceled",
          canceledAt: new Date(),
          canceledReason: params.canceledReason,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(appointments.id, params.id),
            eq(appointments.clinicId, params.clinicId),
            isNull(appointments.deletedAt),
          ),
        )
        .returning({ id: appointments.id })

      if (!row) {
        throw new Error("Appointment not found for cancel")
      }

      const canceled = await appointmentRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!canceled) {
        throw new Error("Failed to load appointment after cancel")
      }

      return canceled
    })
  },
}
