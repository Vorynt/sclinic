import { Permission } from "@/config/permissions"
import { hasAllPermissions } from "@/core/permissions"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditErrorFields, recordAudit } from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import { DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML } from "@/modules/medical-records/constants/attendance-declaration-layout-default"
import { DEFAULT_EXAM_REQUEST_LAYOUT_HTML } from "@/modules/medical-records/constants/exam-request-layout-default"
import { DEFAULT_MEDICAL_CERTIFICATE_LAYOUT_HTML } from "@/modules/medical-records/constants/medical-certificate-layout-default"
import {
  usesClinicPrescriptionLayouts,
  type ClinicalDocumentKind,
} from "@/modules/medical-records/constants/clinical-documents"
import { canEditPrescription } from "@/modules/medical-records/constants/prescriptions"
import type {
  CreateAttendanceDeclarationDto,
  CreateExamRequestDto,
  CreateMedicalCertificateDto,
  CreatePrescriptionDto,
  DeletePrescriptionDraftDto,
  GetPrescriptionDto,
  IssuePrescriptionDto,
  ListAppointmentPrescriptionsDto,
  ListPatientPrescriptionsDto,
  UpdateAttendanceDeclarationDraftDto,
  UpdateExamRequestDraftDto,
  UpdateMedicalCertificateDraftDto,
  UpdatePrescriptionDraftDto,
} from "@/modules/medical-records/dto/prescription.dto"
import { prescriptionRepository } from "@/modules/medical-records/repositories/prescription.repository"
import {
  attendanceDeclarationMetadataSchema,
  examRequestMetadataSchema,
  medicalCertificateMetadataSchema,
} from "@/modules/medical-records/schemas/prescription.schema"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import type {
  Prescription,
  PrescriptionLayoutSource,
  PrescriptionsForAppointment,
} from "@/modules/medical-records/types/prescription"
import { buildAttendanceDeclarationBody } from "@/modules/medical-records/utils/attendance-declaration-body"
import { buildExamRequestBody } from "@/modules/medical-records/utils/exam-request-body"
import { buildMedicalCertificateBody } from "@/modules/medical-records/utils/medical-certificate-body"
import {
  toClinicSnapshot,
  toPatientSnapshot,
  toProfessionalSnapshot,
  toProfessionalSnapshotFromAppointment,
} from "@/modules/medical-records/utils/prescription-snapshots"
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription"
import { sanitizePrescriptionHtml } from "@/modules/medical-records/utils/sanitize-prescription-html"
import { patientService } from "@/modules/patients/services/patient.service"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

function prescriptionAuditSnapshot(prescription: Prescription) {
  return {
    id: prescription.id,
    kind: prescription.kind,
    appointmentId: prescription.appointmentId,
    patientId: prescription.patientId,
    status: prescription.status,
    plainTextPreview: prescription.plainText.slice(0, 200),
    issuedAt: prescription.issuedAt?.toISOString() ?? null,
  }
}

function attendanceDeclarationSystemLayout(): PrescriptionLayoutSource {
  return {
    html: DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML,
    version: null,
    source: "system_default",
    layout: null,
  }
}

function medicalCertificateSystemLayout(): PrescriptionLayoutSource {
  return {
    html: DEFAULT_MEDICAL_CERTIFICATE_LAYOUT_HTML,
    version: null,
    source: "system_default",
    layout: null,
  }
}

function examRequestSystemLayout(): PrescriptionLayoutSource {
  return {
    html: DEFAULT_EXAM_REQUEST_LAYOUT_HTML,
    version: null,
    source: "system_default",
    layout: null,
  }
}

const SYSTEM_LAYOUT_BY_KIND: Partial<
  Record<ClinicalDocumentKind, () => PrescriptionLayoutSource>
> = {
  attendance_declaration: attendanceDeclarationSystemLayout,
  medical_certificate: medicalCertificateSystemLayout,
  exam_request: examRequestSystemLayout,
}

async function resolveLayoutForKind(params: {
  kind: ClinicalDocumentKind
  layoutId: string | null
  ctx: AuthRequestContext
}): Promise<PrescriptionLayoutSource> {
  if (!usesClinicPrescriptionLayouts(params.kind)) {
    const resolveSystemLayout = SYSTEM_LAYOUT_BY_KIND[params.kind]
    if (resolveSystemLayout) {
      return resolveSystemLayout()
    }
    throw new AppError(ErrorCode.VALIDATION_FAILED, {
      message: "Tipo de documento ainda não suportado.",
    })
  }
  return prescriptionLayoutService.resolveById(params.layoutId, params.ctx)
}

export const prescriptionService = {
  async listForAppointment(
    data: ListAppointmentPrescriptionsDto,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionsForAppointment> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )
    const items = await prescriptionRepository.listByAppointment({
      clinicId: appointment.clinicId,
      appointmentId: appointment.id,
      kind: data.kind,
    })

    const templates = await prescriptionLayoutService.listTemplateOptions(ctx)
    const layout = await prescriptionLayoutService.resolveDefaultLayout(ctx)
    const clinic = await clinicService.getById(appointment.clinicId, ctx)
    const patient = await patientService.getById(appointment.patientId, ctx)

    let professional =
      toProfessionalSnapshotFromAppointment({
        professionalId: appointment.professionalId,
        professionalName: appointment.professionalName,
      })
    if (appointment.professionalId) {
      const full = await professionalService.getByIdForRecords(
        appointment.professionalId,
        ctx,
      )
      if (full) professional = toProfessionalSnapshot(full)
    }

    return {
      items,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      editable:
        canEditPrescription(appointment.status) &&
        hasAllPermissions(auth.permissions, [Permission.RECORDS_WRITE]),
      templates,
      preview: {
        layoutHtml: layout.html,
        clinic: toClinicSnapshot(clinic),
        patient: toPatientSnapshot(patient),
        professional,
      },
    }
  },

  async listPatientHistory(
    data: ListPatientPrescriptionsDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription[]> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    await patientService.getById(data.patientId, ctx)
    return prescriptionRepository.listByPatient({
      clinicId: auth.clinicId,
      patientId: data.patientId,
      excludeAppointmentId: data.excludeAppointmentId,
      kind: data.kind,
    })
  },

  async getById(
    data: GetPrescriptionDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    const prescription = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!prescription) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Documento não encontrado.",
      })
    }
    return prescription
  },

  /**
   * Returns the fully rendered HTML document for print/preview.
   * Issued: uses frozen snapshots. Draft: live layout + current party data.
   */
  async getRenderedHtml(
    data: GetPrescriptionDto,
    ctx: AuthRequestContext,
  ): Promise<{ html: string; prescription: Prescription }> {
    const prescription = await prescriptionService.getById(data, ctx)

    if (
      prescription.status === "issued" &&
      prescription.layoutHtml &&
      prescription.clinicSnapshot &&
      prescription.patientSnapshot
    ) {
      return {
        prescription,
        html: renderPrescriptionHtml({
          layoutHtml: prescription.layoutHtml,
          body: prescription.body,
          clinic: prescription.clinicSnapshot,
          patient: prescription.patientSnapshot,
          professional: prescription.professionalSnapshot,
          issuedAt: prescription.issuedAt,
        }),
      }
    }

    const layout = await resolveLayoutForKind({
      kind: prescription.kind,
      layoutId: prescription.layoutId,
      ctx,
    })
    const clinic = await clinicService.getById(prescription.clinicId, ctx)
    const patient = await patientService.getById(prescription.patientId, ctx)
    let professionalSnapshot =
      toProfessionalSnapshotFromAppointment({
        professionalId: prescription.professionalId,
        professionalName: prescription.professionalName,
      })

    if (prescription.professionalId) {
      const professional = await professionalService.getByIdForRecords(
        prescription.professionalId,
        ctx,
      )
      if (professional) {
        professionalSnapshot = toProfessionalSnapshot(professional)
      }
    }

    return {
      prescription,
      html: renderPrescriptionHtml({
        layoutHtml: layout.html,
        body: prescription.body,
        clinic: toClinicSnapshot(clinic),
        patient: toPatientSnapshot(patient),
        professional: professionalSnapshot,
        issuedAt: null,
      }),
    }
  },

  async create(
    data: CreatePrescriptionDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível criar receitas enquanto o atendimento está em andamento.",
      })
    }

    const body = sanitizePrescriptionHtml(data.body)
    const plainText = data.plainText.trim()
    if (!plainText) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Escreva o conteúdo da receita.",
      })
    }

    let layoutId: string | null = data.layoutId ?? null
    if (layoutId) {
      await prescriptionLayoutService.resolveById(layoutId, ctx)
    } else {
      const defaultLayout =
        await prescriptionLayoutService.resolveDefaultLayout(ctx)
      layoutId = defaultLayout.layout?.id ?? null
    }

    try {
      const prescription = await prescriptionRepository.create({
        clinicId: auth.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        kind: "prescription",
        metadata: null,
        layoutId,
        body,
        plainText,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: { after: prescriptionAuditSnapshot(prescription) },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        changes: {
          after: {
            appointmentId: appointment.id,
            kind: "prescription",
            plainTextPreview: plainText.slice(0, 200),
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async createAttendanceDeclaration(
    data: CreateAttendanceDeclarationDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível criar documentos enquanto o atendimento está em andamento.",
      })
    }

    const notes = data.notes?.trim() || null
    const metadata = attendanceDeclarationMetadataSchema.parse({ notes })
    const clinic = await clinicService.getById(appointment.clinicId, ctx)
    const patient = await patientService.getById(appointment.patientId, ctx)
    const patientSnapshot = toPatientSnapshot(patient)
    const { body, plainText } = buildAttendanceDeclarationBody({
      patientName: patient.name,
      patientDocument: patientSnapshot.document,
      appointmentStartsAt: appointment.startsAt,
      professionalName: appointment.professionalName,
      clinicName: clinic.name,
      notes,
    })

    try {
      const prescription = await prescriptionRepository.create({
        clinicId: auth.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        kind: "attendance_declaration",
        metadata,
        layoutId: null,
        body: sanitizePrescriptionHtml(body),
        plainText,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: { after: prescriptionAuditSnapshot(prescription) },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        changes: {
          after: {
            appointmentId: appointment.id,
            kind: "attendance_declaration",
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async updateAttendanceDeclarationDraft(
    data: UpdateAttendanceDeclarationDraftDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Documento não encontrado.",
      })
    }
    if (existing.kind !== "attendance_declaration") {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Este documento não é uma declaração de comparecimento.",
      })
    }
    if (existing.status !== "draft") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Documentos emitidos não podem ser editados.",
      })
    }

    const appointment = await appointmentService.getById(
      existing.appointmentId,
      ctx,
    )
    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar documentos enquanto o atendimento está em andamento.",
      })
    }

    const notes = data.notes?.trim() || null
    const metadata = attendanceDeclarationMetadataSchema.parse({ notes })
    const clinic = await clinicService.getById(appointment.clinicId, ctx)
    const patient = await patientService.getById(appointment.patientId, ctx)
    const patientSnapshot = toPatientSnapshot(patient)
    const { body, plainText } = buildAttendanceDeclarationBody({
      patientName: patient.name,
      patientDocument: patientSnapshot.document,
      appointmentStartsAt: appointment.startsAt,
      professionalName: appointment.professionalName,
      clinicName: clinic.name,
      notes,
    })

    try {
      const prescription = await prescriptionRepository.updateDraft({
        id: existing.id,
        clinicId: auth.clinicId,
        professionalId: appointment.professionalId,
        metadata,
        body: sanitizePrescriptionHtml(body),
        plainText,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: {
          before: prescriptionAuditSnapshot(existing),
          after: prescriptionAuditSnapshot(prescription),
        },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async createMedicalCertificate(
    data: CreateMedicalCertificateDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível criar documentos enquanto o atendimento está em andamento.",
      })
    }

    const cid = data.cid?.trim() || null
    const notes = data.notes?.trim() || null
    const metadata = medicalCertificateMetadataSchema.parse({
      daysOff: data.daysOff,
      cid,
      notes,
    })
    const patient = await patientService.getById(appointment.patientId, ctx)
    const patientSnapshot = toPatientSnapshot(patient)
    const { body, plainText } = buildMedicalCertificateBody({
      patientName: patient.name,
      patientDocument: patientSnapshot.document,
      daysOff: metadata.daysOff,
      cid: metadata.cid,
      notes: metadata.notes,
    })

    try {
      const prescription = await prescriptionRepository.create({
        clinicId: auth.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        kind: "medical_certificate",
        metadata,
        layoutId: null,
        body: sanitizePrescriptionHtml(body),
        plainText,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: { after: prescriptionAuditSnapshot(prescription) },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        changes: {
          after: {
            appointmentId: appointment.id,
            kind: "medical_certificate",
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async updateMedicalCertificateDraft(
    data: UpdateMedicalCertificateDraftDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Documento não encontrado.",
      })
    }
    if (existing.kind !== "medical_certificate") {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Este documento não é um atestado médico.",
      })
    }
    if (existing.status !== "draft") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Documentos emitidos não podem ser editados.",
      })
    }

    const appointment = await appointmentService.getById(
      existing.appointmentId,
      ctx,
    )
    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar documentos enquanto o atendimento está em andamento.",
      })
    }

    const cid = data.cid?.trim() || null
    const notes = data.notes?.trim() || null
    const metadata = medicalCertificateMetadataSchema.parse({
      daysOff: data.daysOff,
      cid,
      notes,
    })
    const patient = await patientService.getById(appointment.patientId, ctx)
    const patientSnapshot = toPatientSnapshot(patient)
    const { body, plainText } = buildMedicalCertificateBody({
      patientName: patient.name,
      patientDocument: patientSnapshot.document,
      daysOff: metadata.daysOff,
      cid: metadata.cid,
      notes: metadata.notes,
    })

    try {
      const prescription = await prescriptionRepository.updateDraft({
        id: existing.id,
        clinicId: auth.clinicId,
        professionalId: appointment.professionalId,
        metadata,
        body: sanitizePrescriptionHtml(body),
        plainText,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: {
          before: prescriptionAuditSnapshot(existing),
          after: prescriptionAuditSnapshot(prescription),
        },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async createExamRequest(
    data: CreateExamRequestDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const appointment = await appointmentService.getById(
      data.appointmentId,
      ctx,
    )

    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível criar documentos enquanto o atendimento está em andamento.",
      })
    }

    const notes = data.notes?.trim() || null
    const metadata = examRequestMetadataSchema.parse({
      exams: data.exams,
      notes,
    })
    const patient = await patientService.getById(appointment.patientId, ctx)
    const patientSnapshot = toPatientSnapshot(patient)
    const { body, plainText } = buildExamRequestBody({
      patientName: patient.name,
      patientDocument: patientSnapshot.document,
      exams: metadata.exams,
      notes: metadata.notes,
    })

    try {
      const prescription = await prescriptionRepository.create({
        clinicId: auth.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        kind: "exam_request",
        metadata,
        layoutId: null,
        body: sanitizePrescriptionHtml(body),
        plainText,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: { after: prescriptionAuditSnapshot(prescription) },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        changes: {
          after: {
            appointmentId: appointment.id,
            kind: "exam_request",
          },
        },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async updateExamRequestDraft(
    data: UpdateExamRequestDraftDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Documento não encontrado.",
      })
    }
    if (existing.kind !== "exam_request") {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Este documento não é uma solicitação de exames.",
      })
    }
    if (existing.status !== "draft") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Documentos emitidos não podem ser editados.",
      })
    }

    const appointment = await appointmentService.getById(
      existing.appointmentId,
      ctx,
    )
    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar documentos enquanto o atendimento está em andamento.",
      })
    }

    const notes = data.notes?.trim() || null
    const metadata = examRequestMetadataSchema.parse({
      exams: data.exams,
      notes,
    })
    const patient = await patientService.getById(appointment.patientId, ctx)
    const patientSnapshot = toPatientSnapshot(patient)
    const { body, plainText } = buildExamRequestBody({
      patientName: patient.name,
      patientDocument: patientSnapshot.document,
      exams: metadata.exams,
      notes: metadata.notes,
    })

    try {
      const prescription = await prescriptionRepository.updateDraft({
        id: existing.id,
        clinicId: auth.clinicId,
        professionalId: appointment.professionalId,
        metadata,
        body: sanitizePrescriptionHtml(body),
        plainText,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: {
          before: prescriptionAuditSnapshot(existing),
          after: prescriptionAuditSnapshot(prescription),
        },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async updateDraft(
    data: UpdatePrescriptionDraftDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Receita não encontrada.",
      })
    }
    if (existing.kind !== "prescription") {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Use a ação específica deste tipo de documento.",
      })
    }
    if (existing.status !== "draft") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Receitas emitidas não podem ser editadas.",
      })
    }

    const appointment = await appointmentService.getById(
      existing.appointmentId,
      ctx,
    )
    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível editar receitas enquanto o atendimento está em andamento.",
      })
    }

    const body = sanitizePrescriptionHtml(data.body)
    const plainText = data.plainText.trim()
    if (!plainText) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Escreva o conteúdo da receita.",
      })
    }

    if (data.layoutId !== undefined && data.layoutId !== null) {
      await prescriptionLayoutService.resolveById(data.layoutId, ctx)
    }

    try {
      const prescription = await prescriptionRepository.updateDraft({
        id: existing.id,
        clinicId: auth.clinicId,
        professionalId: appointment.professionalId,
        layoutId: data.layoutId,
        body,
        plainText,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: {
          before: prescriptionAuditSnapshot(existing),
          after: prescriptionAuditSnapshot(prescription),
        },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async issue(
    data: IssuePrescriptionDto,
    ctx: AuthRequestContext,
  ): Promise<Prescription> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Documento não encontrado.",
      })
    }
    if (existing.status !== "draft") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Este documento já foi emitido.",
      })
    }
    if (!existing.plainText.trim()) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "Escreva o conteúdo do documento antes de emitir.",
      })
    }

    const appointment = await appointmentService.getById(
      existing.appointmentId,
      ctx,
    )
    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível emitir documentos enquanto o atendimento está em andamento.",
      })
    }

    const layout = await resolveLayoutForKind({
      kind: existing.kind,
      layoutId: existing.layoutId,
      ctx,
    })
    const clinic = await clinicService.getById(auth.clinicId, ctx)
    const patient = await patientService.getById(appointment.patientId, ctx)

    let professionalSnapshot =
      toProfessionalSnapshotFromAppointment({
        professionalId: appointment.professionalId,
        professionalName: appointment.professionalName,
      })
    if (appointment.professionalId) {
      const professional = await professionalService.getByIdForRecords(
        appointment.professionalId,
        ctx,
      )
      if (professional) {
        professionalSnapshot = toProfessionalSnapshot(professional)
      }
    }

    const issuedAt = new Date()
    const layoutHtml = sanitizePrescriptionHtml(layout.html)

    try {
      const prescription = await prescriptionRepository.issue({
        id: existing.id,
        clinicId: auth.clinicId,
        professionalId: appointment.professionalId,
        updatedBy: auth.user.id,
        payload: {
          layoutHtml,
          layoutVersion: layout.version,
          clinicSnapshot: toClinicSnapshot(clinic),
          patientSnapshot: toPatientSnapshot(patient),
          professionalSnapshot,
          issuedAt,
        },
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_ISSUE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: prescription.id,
        changes: {
          before: prescriptionAuditSnapshot(existing),
          after: prescriptionAuditSnapshot(prescription),
        },
      })

      return prescription
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_ISSUE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async deleteDraft(
    data: DeletePrescriptionDraftDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requirePermission(ctx, Permission.RECORDS_WRITE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Documento não encontrado.",
      })
    }
    if (existing.status !== "draft") {
      throw new AppError(ErrorCode.CONFLICT, {
        message: "Documentos emitidos não podem ser excluídos.",
      })
    }

    const appointment = await appointmentService.getById(
      existing.appointmentId,
      ctx,
    )
    if (!canEditPrescription(appointment.status)) {
      throw new AppError(ErrorCode.CONFLICT, {
        message:
          "Só é possível excluir rascunhos enquanto o atendimento está em andamento.",
      })
    }

    try {
      await prescriptionRepository.softDeleteDraft({
        id: existing.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION,
        entityId: existing.id,
        changes: { before: prescriptionAuditSnapshot(existing) },
        ...auditErrorFields(error),
      })
      throw error
    }
  },
}
