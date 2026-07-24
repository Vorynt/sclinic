import { and, asc, count, eq, ilike, isNull, or } from "drizzle-orm"

import { db } from "@/db"
import { patients } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import type { UpdatePatientDto } from "@/modules/patients/dto/update-patient.dto"
import { toPatient } from "@/modules/patients/mappers/patient.mapper"
import type { Patient } from "@/modules/patients/types/patient"
import {
  toPaginatedResult,
  type PaginatedResult,
} from "@/types/pagination"
import { stripCpf } from "@/utils/cpf"

function buildSearchCondition(q: string) {
  const digits = stripCpf(q)
  const nameMatch = ilike(patients.fullName, `%${q}%`)

  return digits.length > 0
    ? or(nameMatch, ilike(patients.document, `%${digits}%`))
    : nameMatch
}

export const patientRepository = {
  async create(params: {
    clinicId: string
    createdBy: string
    data: CreatePatientDto
  }): Promise<Patient> {
    return withDbError(async () => {
      const [row] = await db
        .insert(patients)
        .values({
          clinicId: params.clinicId,
          fullName: params.data.name,
          document: params.data.cpf,
          email: params.data.email ?? null,
          phone: params.data.phone ?? null,
          birthDate: params.data.birthDate ?? null,
          status: "active",
          createdBy: params.createdBy,
          updatedBy: params.createdBy,
        })
        .returning()

      if (!row) {
        throw new Error("Failed to create patient")
      }

      return toPatient(row)
    })
  },

  async listByClinic(params: {
    clinicId: string
    q?: string
    page: number
    pageSize: number
  }): Promise<PaginatedResult<Patient>> {
    return withDbError(async () => {
      const where = and(
        eq(patients.clinicId, params.clinicId),
        isNull(patients.deletedAt),
        params.q ? buildSearchCondition(params.q) : undefined,
      )

      const offset = (params.page - 1) * params.pageSize

      const [totalRow, rows] = await Promise.all([
        db.select({ total: count() }).from(patients).where(where),
        db
          .select()
          .from(patients)
          .where(where)
          .orderBy(asc(patients.fullName))
          .limit(params.pageSize)
          .offset(offset),
      ])

      return toPaginatedResult({
        items: rows.map(toPatient),
        total: totalRow[0]?.total ?? 0,
        page: params.page,
        pageSize: params.pageSize,
      })
    })
  },

  async findById(id: string, clinicId: string): Promise<Patient | null> {
    return withDbError(async () => {
      const [row] = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.id, id),
            eq(patients.clinicId, clinicId),
            isNull(patients.deletedAt),
          ),
        )
        .limit(1)

      return row ? toPatient(row) : null
    })
  },

  async update(params: {
    id: string
    clinicId: string
    updatedBy: string
    data: Omit<UpdatePatientDto, "id">
  }): Promise<Patient> {
    return withDbError(async () => {
      const { name, cpf, email, phone, birthDate } = params.data

      const [row] = await db
        .update(patients)
        .set({
          ...(name !== undefined ? { fullName: name } : {}),
          ...(cpf !== undefined ? { document: cpf } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(birthDate !== undefined ? { birthDate } : {}),
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(patients.id, params.id),
            eq(patients.clinicId, params.clinicId),
            isNull(patients.deletedAt),
          ),
        )
        .returning()

      if (!row) {
        throw new Error("Patient not found for update")
      }

      return toPatient(row)
    })
  },

  async softDelete(params: {
    id: string
    clinicId: string
    updatedBy: string
  }): Promise<void> {
    return withDbError(async () => {
      const [row] = await db
        .update(patients)
        .set({
          deletedAt: new Date(),
          status: "archived",
          updatedBy: params.updatedBy,
        })
        .where(
          and(
            eq(patients.id, params.id),
            eq(patients.clinicId, params.clinicId),
            isNull(patients.deletedAt),
          ),
        )
        .returning({ id: patients.id })

      if (!row) {
        throw new Error("Patient not found for delete")
      }
    })
  },
}
