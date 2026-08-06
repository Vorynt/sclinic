import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db"
import {
  appointmentWaitlist,
  clinicServices,
  patients,
  professionalDisplayNameSql,
  professionals,
} from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { EnqueueWaitlistDto } from "@/modules/appointments/dto/enqueue-waitlist.dto"
import { toWaitlistEntry } from "@/modules/appointments/mappers/waitlist.mapper"
import type {
  WaitlistEntry,
  WaitlistStatus,
} from "@/modules/appointments/types/waitlist"

const waitlistSelect = {
  id: appointmentWaitlist.id,
  clinicId: appointmentWaitlist.clinicId,
  patientId: appointmentWaitlist.patientId,
  patientName: patients.fullName,
  professionalId: appointmentWaitlist.professionalId,
  professionalName: professionalDisplayNameSql,
  serviceId: appointmentWaitlist.serviceId,
  serviceName: clinicServices.name,
  status: appointmentWaitlist.status,
  notes: appointmentWaitlist.notes,
  promotedAppointmentId: appointmentWaitlist.promotedAppointmentId,
  createdAt: appointmentWaitlist.createdAt,
  updatedAt: appointmentWaitlist.updatedAt,
}

function waitlistJoin() {
  return db
    .select(waitlistSelect)
    .from(appointmentWaitlist)
    .innerJoin(patients, eq(patients.id, appointmentWaitlist.patientId))
    .leftJoin(
      professionals,
      eq(professionals.id, appointmentWaitlist.professionalId),
    )
    .leftJoin(
      clinicServices,
      eq(clinicServices.id, appointmentWaitlist.serviceId),
    )
}

export const waitlistRepository = {
  async listByClinic(params: {
    clinicId: string
    status?: WaitlistStatus
    professionalId?: string
  }): Promise<WaitlistEntry[]> {
    return withDbError(async () => {
      const rows = await waitlistJoin()
        .where(
          and(
            eq(appointmentWaitlist.clinicId, params.clinicId),
            isNull(appointmentWaitlist.deletedAt),
            params.status
              ? eq(appointmentWaitlist.status, params.status)
              : undefined,
            params.professionalId
              ? eq(appointmentWaitlist.professionalId, params.professionalId)
              : undefined,
          ),
        )
        .orderBy(asc(appointmentWaitlist.createdAt))

      return rows.map(toWaitlistEntry)
    })
  },

  async findById(id: string, clinicId: string): Promise<WaitlistEntry | null> {
    return withDbError(async () => {
      const [row] = await waitlistJoin()
        .where(
          and(
            eq(appointmentWaitlist.id, id),
            eq(appointmentWaitlist.clinicId, clinicId),
            isNull(appointmentWaitlist.deletedAt),
          ),
        )
        .limit(1)

      return row ? toWaitlistEntry(row) : null
    })
  },

  async create(params: {
    clinicId: string
    createdBy: string
    data: EnqueueWaitlistDto
  }): Promise<WaitlistEntry> {
    return withDbError(async () => {
      const [row] = await db
        .insert(appointmentWaitlist)
        .values({
          clinicId: params.clinicId,
          patientId: params.data.patientId,
          professionalId: params.data.professionalId ?? null,
          serviceId: params.data.serviceId ?? null,
          notes: params.data.notes ?? null,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({ id: appointmentWaitlist.id })

      if (!row) {
        throw new Error("Failed to create waitlist entry")
      }

      const created = await waitlistRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!created) {
        throw new Error("Failed to load waitlist entry after creation")
      }
      return created
    })
  },

  async markStatus(params: {
    id: string
    clinicId: string
    status: Extract<WaitlistStatus, "canceled" | "promoted">
    promotedAppointmentId?: string
    updatedBy: string
  }): Promise<WaitlistEntry> {
    return withDbError(async () => {
      const [row] = await db
        .update(appointmentWaitlist)
        .set({
          status: params.status,
          promotedAppointmentId: params.promotedAppointmentId ?? null,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(appointmentWaitlist.id, params.id),
            eq(appointmentWaitlist.clinicId, params.clinicId),
            isNull(appointmentWaitlist.deletedAt),
          ),
        )
        .returning({ id: appointmentWaitlist.id })

      if (!row) {
        throw new Error("Waitlist entry not found for status update")
      }

      const updated = await waitlistRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load waitlist entry after status update")
      }
      return updated
    })
  },
}
