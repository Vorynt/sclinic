import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
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

function patientSnapshot(patient: Patient) {
  return {
    id: patient.id,
    name: patient.name,
    cpf: patient.cpf,
    email: patient.email ?? null,
    phone: patient.phone ?? null,
    birthDate: patient.birthDate ?? null,
    status: patient.status,
  }
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
    const actor = auditActorFromAuth(auth)

    try {
      const patient = await patientRepository.create({
        clinicId: auth.clinicId,
        createdBy: auth.user.id,
        data,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PATIENT_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: patient.id,
        changes: { after: patientSnapshot(patient) },
      })

      return patient
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PATIENT_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        changes: { after: { name: data.name, cpf: data.cpf } },
        ...auditErrorFields(error),
      })
      return rethrowAsConflict(error)
    }
  },

  async update(data: UpdatePatientDto, ctx: AuthRequestContext): Promise<Patient> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_WRITE)
    const actor = auditActorFromAuth(auth)
    const { id, ...rest } = data

    const existing = await patientRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    try {
      const patient = await patientRepository.update({
        id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        data: rest,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PATIENT_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: patient.id,
        changes: {
          before: patientSnapshot(existing),
          after: patientSnapshot(patient),
        },
      })

      return patient
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PATIENT_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: id,
        changes: { before: patientSnapshot(existing), after: rest },
        ...auditErrorFields(error),
      })
      return rethrowAsConflict(error)
    }
  },

  async delete(id: string, ctx: AuthRequestContext): Promise<void> {
    const auth = await requirePermission(ctx, Permission.PATIENTS_WRITE)
    const actor = auditActorFromAuth(auth)

    const existing = await patientRepository.findById(id, auth.clinicId)
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Paciente não encontrado.",
      })
    }

    try {
      await patientRepository.softDelete({
        id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PATIENT_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: id,
        changes: { before: patientSnapshot(existing) },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PATIENT_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PATIENT,
        entityId: id,
        changes: { before: patientSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
