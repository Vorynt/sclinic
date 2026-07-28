import { and, desc, eq, isNull, max, ne } from "drizzle-orm"

import { db } from "@/db"
import {
  appointments,
  prescriptionLayouts,
  prescriptions,
  professionalDisplayNameSql,
  professionals,
  type PrescriptionPartySnapshot,
} from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import {
  toPrescription,
  toPrescriptionLayout,
} from "@/modules/medical-records/mappers/prescription.mapper"
import type {
  Prescription,
  PrescriptionLayout,
} from "@/modules/medical-records/types/prescription"

const prescriptionSelect = {
  id: prescriptions.id,
  clinicId: prescriptions.clinicId,
  patientId: prescriptions.patientId,
  appointmentId: prescriptions.appointmentId,
  professionalId: prescriptions.professionalId,
  professionalName: professionalDisplayNameSql,
  status: prescriptions.status,
  body: prescriptions.body,
  plainText: prescriptions.plainText,
  layoutHtml: prescriptions.layoutHtml,
  layoutVersion: prescriptions.layoutVersion,
  clinicSnapshot: prescriptions.clinicSnapshot,
  patientSnapshot: prescriptions.patientSnapshot,
  professionalSnapshot: prescriptions.professionalSnapshot,
  issuedAt: prescriptions.issuedAt,
  appointmentStartsAt: appointments.startsAt,
  createdAt: prescriptions.createdAt,
  updatedAt: prescriptions.updatedAt,
}

function prescriptionJoin() {
  return db
    .select(prescriptionSelect)
    .from(prescriptions)
    .innerJoin(appointments, eq(appointments.id, prescriptions.appointmentId))
    .leftJoin(
      professionals,
      eq(professionals.id, prescriptions.professionalId),
    )
}

export type PrescriptionIssuePayload = {
  layoutHtml: string
  layoutVersion: number | null
  clinicSnapshot: PrescriptionPartySnapshot
  patientSnapshot: PrescriptionPartySnapshot
  professionalSnapshot: PrescriptionPartySnapshot | null
  issuedAt: Date
}

export const prescriptionRepository = {
  async findById(
    id: string,
    clinicId: string,
  ): Promise<Prescription | null> {
    return withDbError(async () => {
      const [row] = await prescriptionJoin()
        .where(
          and(
            eq(prescriptions.id, id),
            eq(prescriptions.clinicId, clinicId),
            isNull(prescriptions.deletedAt),
          ),
        )
        .limit(1)

      return row ? toPrescription(row) : null
    })
  },

  async listByAppointment(params: {
    clinicId: string
    appointmentId: string
  }): Promise<Prescription[]> {
    return withDbError(async () => {
      const rows = await prescriptionJoin()
        .where(
          and(
            eq(prescriptions.clinicId, params.clinicId),
            eq(prescriptions.appointmentId, params.appointmentId),
            isNull(prescriptions.deletedAt),
          ),
        )
        .orderBy(desc(prescriptions.createdAt))

      return rows.map(toPrescription)
    })
  },

  async listByPatient(params: {
    clinicId: string
    patientId: string
    excludeAppointmentId?: string
  }): Promise<Prescription[]> {
    return withDbError(async () => {
      const rows = await prescriptionJoin()
        .where(
          and(
            eq(prescriptions.clinicId, params.clinicId),
            eq(prescriptions.patientId, params.patientId),
            params.excludeAppointmentId
              ? ne(prescriptions.appointmentId, params.excludeAppointmentId)
              : undefined,
            isNull(prescriptions.deletedAt),
            isNull(appointments.deletedAt),
          ),
        )
        .orderBy(desc(appointments.startsAt), desc(prescriptions.createdAt))

      return rows.map(toPrescription)
    })
  },

  async create(params: {
    clinicId: string
    patientId: string
    appointmentId: string
    professionalId: string | null
    body: string
    plainText: string
    createdBy: string
  }): Promise<Prescription> {
    return withDbError(async () => {
      const [row] = await db
        .insert(prescriptions)
        .values({
          clinicId: params.clinicId,
          patientId: params.patientId,
          appointmentId: params.appointmentId,
          professionalId: params.professionalId,
          status: "draft",
          body: params.body,
          plainText: params.plainText,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({ id: prescriptions.id })

      if (!row) {
        throw new Error("Failed to create prescription")
      }

      const created = await prescriptionRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!created) {
        throw new Error("Failed to load prescription after create")
      }
      return created
    })
  },

  async updateDraft(params: {
    id: string
    clinicId: string
    professionalId: string | null
    body: string
    plainText: string
    updatedBy: string
  }): Promise<Prescription> {
    return withDbError(async () => {
      const [row] = await db
        .update(prescriptions)
        .set({
          body: params.body,
          plainText: params.plainText,
          professionalId: params.professionalId,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(prescriptions.id, params.id),
            eq(prescriptions.clinicId, params.clinicId),
            eq(prescriptions.status, "draft"),
            isNull(prescriptions.deletedAt),
          ),
        )
        .returning({ id: prescriptions.id })

      if (!row) {
        throw new Error("Failed to update prescription draft")
      }

      const updated = await prescriptionRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load prescription after update")
      }
      return updated
    })
  },

  async issue(params: {
    id: string
    clinicId: string
    professionalId: string | null
    updatedBy: string
    payload: PrescriptionIssuePayload
  }): Promise<Prescription> {
    return withDbError(async () => {
      const [row] = await db
        .update(prescriptions)
        .set({
          status: "issued",
          professionalId: params.professionalId,
          layoutHtml: params.payload.layoutHtml,
          layoutVersion: params.payload.layoutVersion,
          clinicSnapshot: params.payload.clinicSnapshot,
          patientSnapshot: params.payload.patientSnapshot,
          professionalSnapshot: params.payload.professionalSnapshot,
          issuedAt: params.payload.issuedAt,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(prescriptions.id, params.id),
            eq(prescriptions.clinicId, params.clinicId),
            eq(prescriptions.status, "draft"),
            isNull(prescriptions.deletedAt),
          ),
        )
        .returning({ id: prescriptions.id })

      if (!row) {
        throw new Error("Failed to issue prescription")
      }

      const issued = await prescriptionRepository.findById(
        row.id,
        params.clinicId,
      )
      if (!issued) {
        throw new Error("Failed to load prescription after issue")
      }
      return issued
    })
  },

  async softDeleteDraft(params: {
    id: string
    clinicId: string
    updatedBy: string
  }): Promise<void> {
    return withDbError(async () => {
      const [row] = await db
        .update(prescriptions)
        .set({
          deletedAt: new Date(),
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(prescriptions.id, params.id),
            eq(prescriptions.clinicId, params.clinicId),
            eq(prescriptions.status, "draft"),
            isNull(prescriptions.deletedAt),
          ),
        )
        .returning({ id: prescriptions.id })

      if (!row) {
        throw new Error("Failed to delete prescription draft")
      }
    })
  },
}

export const prescriptionLayoutRepository = {
  async findActive(
    clinicId: string,
  ): Promise<PrescriptionLayout | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: prescriptionLayouts.id,
          clinicId: prescriptionLayouts.clinicId,
          version: prescriptionLayouts.version,
          html: prescriptionLayouts.html,
          isActive: prescriptionLayouts.isActive,
          createdAt: prescriptionLayouts.createdAt,
          updatedAt: prescriptionLayouts.updatedAt,
        })
        .from(prescriptionLayouts)
        .where(
          and(
            eq(prescriptionLayouts.clinicId, clinicId),
            eq(prescriptionLayouts.isActive, true),
            isNull(prescriptionLayouts.deletedAt),
          ),
        )
        .limit(1)

      return row ? toPrescriptionLayout(row) : null
    })
  },

  async createVersion(params: {
    clinicId: string
    html: string
    createdBy: string
  }): Promise<PrescriptionLayout> {
    return withDbError(async () => {
      await db
        .update(prescriptionLayouts)
        .set({
          isActive: false,
          updatedBy: params.createdBy,
        })
        .where(
          and(
            eq(prescriptionLayouts.clinicId, params.clinicId),
            eq(prescriptionLayouts.isActive, true),
            isNull(prescriptionLayouts.deletedAt),
          ),
        )

      const [maxRow] = await db
        .select({ maxVersion: max(prescriptionLayouts.version) })
        .from(prescriptionLayouts)
        .where(eq(prescriptionLayouts.clinicId, params.clinicId))

      const nextVersion = (maxRow?.maxVersion ?? 0) + 1

      const [row] = await db
        .insert(prescriptionLayouts)
        .values({
          clinicId: params.clinicId,
          version: nextVersion,
          html: params.html,
          isActive: true,
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({
          id: prescriptionLayouts.id,
          clinicId: prescriptionLayouts.clinicId,
          version: prescriptionLayouts.version,
          html: prescriptionLayouts.html,
          isActive: prescriptionLayouts.isActive,
          createdAt: prescriptionLayouts.createdAt,
          updatedAt: prescriptionLayouts.updatedAt,
        })

      if (!row) {
        throw new Error("Failed to create prescription layout")
      }

      return toPrescriptionLayout(row)
    })
  },

  async deactivateActive(params: {
    clinicId: string
    updatedBy: string
  }): Promise<void> {
    return withDbError(async () => {
      await db
        .update(prescriptionLayouts)
        .set({
          isActive: false,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(prescriptionLayouts.clinicId, params.clinicId),
            eq(prescriptionLayouts.isActive, true),
            isNull(prescriptionLayouts.deletedAt),
          ),
        )
    })
  },
}
