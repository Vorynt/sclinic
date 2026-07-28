import { Permission } from "@/config/permissions"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import {
  auditErrorFields,
  recordAudit,
} from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { canEditClinicalNote } from "@/modules/medical-records/constants/clinical-notes"
import {
  getClinicalNoteTemplateOrThrow,
} from "@/modules/medical-records/constants/clinical-note-templates"
import type { ListPatientClinicalNotesDto } from "@/modules/medical-records/dto/list-patient-clinical-notes.dto"
import type { UpsertClinicalNoteDto } from "@/modules/medical-records/dto/upsert-clinical-note.dto"
import { clinicalNoteRepository } from "@/modules/medical-records/repositories/clinical-note.repository"
import {
  buildTemplateValuesSchema,
  isFormUpsert,
} from "@/modules/medical-records/schemas/clinical-note.schema"
import type {
  ClinicalNote,
  ClinicalNoteForAppointment,
} from "@/modules/medical-records/types/clinical-note"
import {
  compileClinicalNoteForm,
  isCompiledNoteEmpty,
} from "@/modules/medical-records/utils/compile-clinical-note-form"
import { patientService } from "@/modules/patients/services/patient.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"
import type { ClinicalNoteContent } from "@/db/schema"

function noteAuditSnapshot(note: {
  id: string
  appointmentId: string
  patientId: string
  plainText: string
  templateId: string | null
}) {
  return {
    id: note.id,
    appointmentId: note.appointmentId,
    patientId: note.patientId,
    templateId: note.templateId,
    plainTextPreview: note.plainText.slice(0, 200),
  }
}

export const clinicalNoteService = {
  async getForAppointment(
    appointmentId: string,
    ctx: AuthRequestContext,
  ): Promise<ClinicalNoteForAppointment> {
    await requirePermission(ctx, Permission.RECORDS_READ)
    const appointment = await appointmentService.getById(appointmentId, ctx)
    const note = await clinicalNoteRepository.findByAppointmentId(
      appointmentId,
      appointment.clinicId,
    )

    return {
      note,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      editable: canEditClinicalNote(appointment.status),
    }
  },

  async listPatientHistory(
    data: ListPatientClinicalNotesDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicalNote[]> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    await patientService.getById(data.patientId, ctx)

    return clinicalNoteRepository.listByPatient({
      clinicId: auth.clinicId,
      patientId: data.patientId,
      excludeAppointmentId: data.excludeAppointmentId,
    })
  },

  async upsert(
    data: UpsertClinicalNoteDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicalNote> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditClinicalNote(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar anotações enquanto o atendimento está em andamento.",
      })
    }

    const existing = await clinicalNoteRepository.findByAppointmentId(
      appointment.id,
      auth.clinicId,
    )

    let payload: {
      content: ClinicalNoteContent
      plainText: string
      templateId: string | null
      formValues: Record<string, unknown> | null
    }

    if (isFormUpsert(data)) {
      const template = getClinicalNoteTemplateOrThrow(data.templateId)
      const formValues = buildTemplateValuesSchema(template).parse(
        data.formValues,
      ) as Record<string, unknown>
      const compiled = compileClinicalNoteForm(template, formValues)
      if (isCompiledNoteEmpty(compiled.plainText)) {
        throw new AppError(ErrorCode.VALIDATION_FAILED, {
          message: "Preencha ao menos um campo da anotação.",
        })
      }
      payload = {
        content: compiled.content as ClinicalNoteContent,
        plainText: compiled.plainText,
        templateId: data.templateId,
        formValues,
      }
    } else {
      payload = {
        content: data.content as ClinicalNoteContent,
        plainText: data.plainText,
        templateId: null,
        formValues: null,
      }
    }

    try {
      const note = existing
        ? await clinicalNoteRepository.update({
            id: existing.id,
            clinicId: auth.clinicId,
            professionalId: appointment.professionalId,
            updatedBy: auth.user.id,
            payload,
          })
        : await clinicalNoteRepository.create({
            clinicId: auth.clinicId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            professionalId: appointment.professionalId,
            createdBy: auth.user.id,
            payload,
          })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINICAL_NOTE_UPSERT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINICAL_NOTE,
        entityId: note.id,
        changes: {
          before: existing ? noteAuditSnapshot(existing) : undefined,
          after: noteAuditSnapshot(note),
        },
      })

      return note
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINICAL_NOTE_UPSERT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINICAL_NOTE,
        entityId: existing?.id,
        changes: {
          before: existing ? noteAuditSnapshot(existing) : undefined,
          after: {
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            templateId: payload.templateId,
            plainTextPreview: payload.plainText.slice(0, 200),
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
