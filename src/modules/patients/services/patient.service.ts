import { Permission } from "@/config/permissions"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import type { CreatePatientDto } from "@/modules/patients/dto/create-patient.dto"
import type { ListPatientsDto } from "@/modules/patients/dto/list-patients.dto"
import type { UpdatePatientDto } from "@/modules/patients/dto/update-patient.dto"
import { patientRepository } from "@/modules/patients/repositories/patient.repository"
import type { Patient } from "@/modules/patients/types/patient"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode, isTechnicalError } from "@/shared/errors"
import type { PaginatedResult } from "@/types/pagination"

/** Maps a CPF unique-constraint violation to a domain conflict error. */
function rethrowAsConflict(error: unknown): never {
  if (isTechnicalError(error) && error.code === ErrorCode.DB_UNIQUE_VIOLATION) {
    throw new AppError(ErrorCode.CONFLICT, {
      message: "Já existe um paciente com este CPF nesta clínica.",
      cause: error,
    })
  }
  throw error
}

export const patientService = {
  async list(
    filters: ListPatientsDto,
    ctx: AuthRequestContext,
  ): Promise<PaginatedResult<Patient>> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_READ)
    return patientRepository.listByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
      page: filters.page,
      pageSize: filters.pageSize,
    })
  },

  async getById(id: string, ctx: AuthRequestContext): Promise<Patient> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_READ)

    const patient = await patientRepository.findById(id, auth.clinicId)
    if (!patient) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    return patient
  },

  async create(data: CreatePatientDto, ctx: AuthRequestContext): Promise<Patient> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_WRITE)

    try {
      return await patientRepository.create({
        clinicId: auth.clinicId,
        createdBy: auth.user.id,
        data,
      })
    } catch (error) {
      return rethrowAsConflict(error)
    }
  },

  async update(data: UpdatePatientDto, ctx: AuthRequestContext): Promise<Patient> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_WRITE)
    const { id, ...rest } = data

    const existing = await patientRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    try {
      return await patientRepository.update({
        id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        data: rest,
      })
    } catch (error) {
      return rethrowAsConflict(error)
    }
  },

  async delete(id: string, ctx: AuthRequestContext): Promise<void> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_WRITE)

    const existing = await patientRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    await patientRepository.softDelete({
      id,
      clinicId: auth.clinicId,
      updatedBy: auth.user.id,
    })
  },
}
