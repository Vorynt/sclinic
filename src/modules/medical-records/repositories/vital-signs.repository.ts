import { and, desc, eq, isNull, ne } from "drizzle-orm"

import { db } from "@/db"
import { appointments, professionals, vitalSigns } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { UpsertVitalSignsDto } from "@/modules/medical-records/dto/upsert-vital-signs.dto"
import { toVitalSigns } from "@/modules/medical-records/mappers/vital-signs.mapper"
import type { VitalSigns } from "@/modules/medical-records/types/vital-signs"

const vitalSignsSelect = {
  id: vitalSigns.id,
  clinicId: vitalSigns.clinicId,
  patientId: vitalSigns.patientId,
  appointmentId: vitalSigns.appointmentId,
  professionalId: vitalSigns.professionalId,
  professionalName: professionals.fullName,
  systolicMmHg: vitalSigns.systolicMmHg,
  diastolicMmHg: vitalSigns.diastolicMmHg,
  heartRateBpm: vitalSigns.heartRateBpm,
  respiratoryRate: vitalSigns.respiratoryRate,
  temperatureC: vitalSigns.temperatureC,
  weightKg: vitalSigns.weightKg,
  heightCm: vitalSigns.heightCm,
  spo2Percent: vitalSigns.spo2Percent,
  appointmentStartsAt: appointments.startsAt,
  createdAt: vitalSigns.createdAt,
  updatedAt: vitalSigns.updatedAt,
}

function vitalSignsJoin() {
  return db
    .select(vitalSignsSelect)
    .from(vitalSigns)
    .innerJoin(appointments, eq(appointments.id, vitalSigns.appointmentId))
    .leftJoin(professionals, eq(professionals.id, vitalSigns.professionalId))
}

function vitalFieldsFromDto(data: Omit<UpsertVitalSignsDto, "appointmentId">) {
  return {
    systolicMmHg: data.systolicMmHg ?? null,
    diastolicMmHg: data.diastolicMmHg ?? null,
    heartRateBpm: data.heartRateBpm ?? null,
    respiratoryRate: data.respiratoryRate ?? null,
    temperatureC: data.temperatureC ?? null,
    weightKg: data.weightKg ?? null,
    heightCm: data.heightCm ?? null,
    spo2Percent: data.spo2Percent ?? null,
  }
}

export const vitalSignsRepository = {
  async findByAppointmentId(
    appointmentId: string,
    clinicId: string,
  ): Promise<VitalSigns | null> {
    return withDbError(async () => {
      const [row] = await vitalSignsJoin()
        .where(
          and(
            eq(vitalSigns.appointmentId, appointmentId),
            eq(vitalSigns.clinicId, clinicId),
            isNull(vitalSigns.deletedAt),
          ),
        )
        .limit(1)

      return row ? toVitalSigns(row) : null
    })
  },

  async listByPatient(params: {
    clinicId: string
    patientId: string
    excludeAppointmentId?: string
  }): Promise<VitalSigns[]> {
    return withDbError(async () => {
      const rows = await vitalSignsJoin()
        .where(
          and(
            eq(vitalSigns.clinicId, params.clinicId),
            eq(vitalSigns.patientId, params.patientId),
            params.excludeAppointmentId
              ? ne(vitalSigns.appointmentId, params.excludeAppointmentId)
              : undefined,
            isNull(vitalSigns.deletedAt),
            isNull(appointments.deletedAt),
          ),
        )
        .orderBy(desc(appointments.startsAt))

      return rows.map(toVitalSigns)
    })
  },

  async create(params: {
    clinicId: string
    patientId: string
    appointmentId: string
    professionalId: string | null
    createdBy: string
    data: Omit<UpsertVitalSignsDto, "appointmentId">
  }): Promise<VitalSigns> {
    return withDbError(async () => {
      const [row] = await db
        .insert(vitalSigns)
        .values({
          clinicId: params.clinicId,
          patientId: params.patientId,
          appointmentId: params.appointmentId,
          professionalId: params.professionalId,
          ...vitalFieldsFromDto(params.data),
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning({ id: vitalSigns.id })

      if (!row) {
        throw new Error("Failed to create vital signs")
      }

      const created = await vitalSignsRepository.findByAppointmentId(
        params.appointmentId,
        params.clinicId,
      )
      if (!created) {
        throw new Error("Failed to load vital signs after create")
      }
      return created
    })
  },

  async update(params: {
    id: string
    clinicId: string
    appointmentId: string
    professionalId: string | null
    updatedBy: string
    data: Omit<UpsertVitalSignsDto, "appointmentId">
  }): Promise<VitalSigns> {
    return withDbError(async () => {
      const [row] = await db
        .update(vitalSigns)
        .set({
          ...vitalFieldsFromDto(params.data),
          professionalId: params.professionalId,
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(vitalSigns.id, params.id),
            eq(vitalSigns.clinicId, params.clinicId),
            isNull(vitalSigns.deletedAt),
          ),
        )
        .returning({ id: vitalSigns.id })

      if (!row) {
        throw new Error("Failed to update vital signs")
      }

      const updated = await vitalSignsRepository.findByAppointmentId(
        params.appointmentId,
        params.clinicId,
      )
      if (!updated) {
        throw new Error("Failed to load vital signs after update")
      }
      return updated
    })
  },
}
