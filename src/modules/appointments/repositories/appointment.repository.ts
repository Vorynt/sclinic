import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  gt,
  inArray,
  isNull,
  lt,
  ne,
  notInArray,
} from "drizzle-orm"

import { db } from "@/db"
import {
  appointments,
  patients,
  professionalClinics,
  professionalDisplayNameSql,
  professionals,
} from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreateAppointmentDto } from "@/modules/appointments/dto/create-appointment.dto"
import { toAppointment } from "@/modules/appointments/mappers/appointment.mapper"
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "@/modules/appointments/types/appointment"

const appointmentSelect = {
  id: appointments.id,
  clinicId: appointments.clinicId,
  patientId: appointments.patientId,
  patientName: patients.fullName,
  professionalId: appointments.professionalId,
  professionalName: professionalDisplayNameSql,
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
    professionalIds?: string[]
  }): Promise<Appointment[]> {
    return withDbError(async () => {
      const rows = await appointmentJoin()
        .where(
          and(
            eq(appointments.clinicId, params.clinicId),
            isNull(appointments.deletedAt),
            lt(appointments.startsAt, params.to),
            gt(appointments.endsAt, params.from),
            params.professionalIds?.length
              ? inArray(appointments.professionalId, params.professionalIds)
              : undefined,
          ),
        )
        .orderBy(asc(appointments.startsAt))

      return rows.map(toAppointment)
    })
  },

  async countInRange(params: {
    clinicId: string
    from: Date
    to: Date
    professionalIds?: string[]
    excludeStatuses?: AppointmentStatus[]
  }): Promise<number> {
    return withDbError(async () => {
      const [row] = await db
        .select({ total: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, params.clinicId),
            isNull(appointments.deletedAt),
            gte(appointments.startsAt, params.from),
            lt(appointments.startsAt, params.to),
            params.professionalIds?.length
              ? inArray(appointments.professionalId, params.professionalIds)
              : undefined,
            params.excludeStatuses?.length
              ? notInArray(appointments.status, params.excludeStatuses)
              : undefined,
          ),
        )

      return row?.total ?? 0
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

  async listByPatient(params: {
    clinicId: string
    patientId: string
    excludeAppointmentId?: string
    limit: number
  }): Promise<Appointment[]> {
    return withDbError(async () => {
      const rows = await appointmentJoin()
        .where(
          and(
            eq(appointments.clinicId, params.clinicId),
            eq(appointments.patientId, params.patientId),
            isNull(appointments.deletedAt),
            params.excludeAppointmentId
              ? ne(appointments.id, params.excludeAppointmentId)
              : undefined,
          ),
        )
        .orderBy(desc(appointments.startsAt))
        .limit(params.limit)

      return rows.map(toAppointment)
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

  async reschedule(params: {
    id: string
    clinicId: string
    updatedBy: string
    professionalId: string
    startsAt: Date
    endsAt: Date
  }): Promise<Appointment> {
    return withDbError(async () => {
      const [row] = await db
        .update(appointments)
        .set({
          professionalId: params.professionalId,
          startsAt: params.startsAt,
          endsAt: params.endsAt,
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
        throw new Error("Appointment not found for reschedule")
      }

      const updated = await appointmentRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load appointment after reschedule")
      }

      return updated
    })
  },

  async updateDetails(params: {
    id: string
    clinicId: string
    updatedBy: string
    type: AppointmentType
    reason: string | null
    notes: string | null
  }): Promise<Appointment> {
    return withDbError(async () => {
      const [row] = await db
        .update(appointments)
        .set({
          type: params.type,
          reason: params.reason,
          notes: params.notes,
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
        throw new Error("Appointment not found for update details")
      }

      const updated = await appointmentRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load appointment after update details")
      }

      return updated
    })
  },

  async updateStatus(params: {
    id: string
    clinicId: string
    updatedBy: string
    status: Extract<
      AppointmentStatus,
      "confirmed" | "no_show" | "checked_in" | "completed"
    >
  }): Promise<Appointment> {
    return withDbError(async () => {
      const [row] = await db
        .update(appointments)
        .set({
          status: params.status,
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
        throw new Error("Appointment not found for status update")
      }

      const updated = await appointmentRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load appointment after status update")
      }

      return updated
    })
  },
}
