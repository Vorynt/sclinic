import { Permission } from "@/config/permissions"
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit"
import { auditErrorFields, recordAudit } from "@/modules/audit/emit"
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { DEFAULT_PRESCRIPTION_LAYOUT_HTML } from "@/modules/medical-records/constants/prescription-layout-default"
import type {
  CreatePrescriptionLayoutDto,
  DeletePrescriptionLayoutDto,
  SetDefaultPrescriptionLayoutDto,
  UpdatePrescriptionLayoutDto,
} from "@/modules/medical-records/dto/prescription.dto"
import {
  DEFAULT_PRESCRIPTION_DOCUMENT_MODEL,
  MAX_PRESCRIPTION_TEMPLATES_PER_CLINIC,
  compilePrescriptionTemplate,
} from "@/modules/medical-records/prescription-template-designer"
import { prescriptionLayoutRepository } from "@/modules/medical-records/repositories/prescription.repository"
import type {
  PrescriptionLayout,
  PrescriptionLayoutSource,
  PrescriptionTemplateOption,
} from "@/modules/medical-records/types/prescription"
import { sanitizePrescriptionHtml } from "@/modules/medical-records/utils/sanitize-prescription-html"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode } from "@/shared/errors"

function toTemplateOption(layout: PrescriptionLayout): PrescriptionTemplateOption {
  return {
    id: layout.id,
    name: layout.name,
    isDefault: layout.isDefault,
    html: layout.html,
  }
}

function systemDefaultSource(): PrescriptionLayoutSource {
  return {
    html: DEFAULT_PRESCRIPTION_LAYOUT_HTML,
    version: null,
    source: "system_default",
    layout: null,
  }
}

function toSource(layout: PrescriptionLayout): PrescriptionLayoutSource {
  return {
    html: layout.html,
    version: layout.version,
    source: "clinic_custom",
    layout,
  }
}

export const prescriptionLayoutService = {
  async resolveDefaultLayout(
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayoutSource> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    const layout = await prescriptionLayoutRepository.findDefault(auth.clinicId)
    return layout ? toSource(layout) : systemDefaultSource()
  },

  /** @deprecated Use resolveDefaultLayout — alias kept for existing call sites. */
  async resolveActiveLayout(
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayoutSource> {
    return prescriptionLayoutService.resolveDefaultLayout(ctx)
  },

  async resolveById(
    layoutId: string | null | undefined,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayoutSource> {
    if (!layoutId) {
      return prescriptionLayoutService.resolveDefaultLayout(ctx)
    }
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    const layout = await prescriptionLayoutRepository.findById(
      layoutId,
      auth.clinicId,
    )
    if (!layout) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Modelo de receita não encontrado.",
      })
    }
    return toSource(layout)
  },

  async listTemplateOptions(
    ctx: AuthRequestContext,
  ): Promise<PrescriptionTemplateOption[]> {
    const auth = await requirePermission(ctx, Permission.RECORDS_READ)
    const layouts = await prescriptionLayoutRepository.listActive(auth.clinicId)
    return layouts.map(toTemplateOption)
  },

  /** Settings: list all active templates. */
  async listForSettings(
    ctx: AuthRequestContext,
  ): Promise<{
    templates: PrescriptionLayout[]
    systemDefaultHtml: string
    maxTemplates: number
  }> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const templates = await prescriptionLayoutRepository.listActive(
      auth.clinicId,
    )
    return {
      templates,
      systemDefaultHtml: DEFAULT_PRESCRIPTION_LAYOUT_HTML,
      maxTemplates: MAX_PRESCRIPTION_TEMPLATES_PER_CLINIC,
    }
  },

  async getByIdForSettings(
    id: string,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayout> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const layout = await prescriptionLayoutRepository.findById(
      id,
      auth.clinicId,
    )
    if (!layout) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Modelo de receita não encontrado.",
      })
    }
    return layout
  },

  async create(
    data: CreatePrescriptionLayoutDto,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayout> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)

    const count = await prescriptionLayoutRepository.countActive(auth.clinicId)
    if (count >= MAX_PRESCRIPTION_TEMPLATES_PER_CLINIC) {
      throw new AppError(ErrorCode.CONFLICT, {
        message: `A clínica pode ter no máximo ${MAX_PRESCRIPTION_TEMPLATES_PER_CLINIC} modelos de receita.`,
      })
    }

    const html = sanitizePrescriptionHtml(
      compilePrescriptionTemplate(data.documentModel),
    )
    const isDefault = data.isDefault === true || count === 0

    try {
      const layout = await prescriptionLayoutRepository.create({
        clinicId: auth.clinicId,
        name: data.name.trim(),
        documentModel: data.documentModel,
        html,
        isDefault,
        createdBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: layout.id,
        changes: {
          after: {
            id: layout.id,
            name: layout.name,
            version: layout.version,
            isDefault: layout.isDefault,
          },
        },
      })

      return layout
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async update(
    data: UpdatePrescriptionLayoutDto,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayout> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionLayoutRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Modelo de receita não encontrado.",
      })
    }

    const html = sanitizePrescriptionHtml(
      compilePrescriptionTemplate(data.documentModel),
    )

    try {
      const layout = await prescriptionLayoutRepository.update({
        id: data.id,
        clinicId: auth.clinicId,
        name: data.name.trim(),
        documentModel: data.documentModel,
        html,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: layout.id,
        changes: {
          before: {
            id: existing.id,
            name: existing.name,
            version: existing.version,
          },
          after: {
            id: layout.id,
            name: layout.name,
            version: layout.version,
          },
        },
      })

      return layout
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: existing.id,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async setDefault(
    data: SetDefaultPrescriptionLayoutDto,
    ctx: AuthRequestContext,
  ): Promise<PrescriptionLayout> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionLayoutRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Modelo de receita não encontrado.",
      })
    }

    try {
      const layout = await prescriptionLayoutRepository.setDefault({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_SET_DEFAULT,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: layout.id,
        changes: {
          after: { id: layout.id, name: layout.name, isDefault: true },
        },
      })

      return layout
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_SET_DEFAULT,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: data.id,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  async delete(
    data: DeletePrescriptionLayoutDto,
    ctx: AuthRequestContext,
  ): Promise<void> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionLayoutRepository.findById(
      data.id,
      auth.clinicId,
    )
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Modelo de receita não encontrado.",
      })
    }

    try {
      await prescriptionLayoutRepository.softDelete({
        id: data.id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      if (existing.isDefault) {
        const remaining = await prescriptionLayoutRepository.listActive(
          auth.clinicId,
        )
        if (remaining[0]) {
          await prescriptionLayoutRepository.setDefault({
            id: remaining[0].id,
            clinicId: auth.clinicId,
            updatedBy: auth.user.id,
          })
        }
      }

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: existing.id,
        changes: {
          before: {
            id: existing.id,
            name: existing.name,
            version: existing.version,
          },
        },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        entityId: existing.id,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  /** Soft-deletes all clinic templates so the system default is used again. */
  async resetToDefault(ctx: AuthRequestContext): Promise<void> {
    const auth = await requirePermission(ctx, Permission.SETTINGS_MANAGE)
    const actor = auditActorFromAuth(auth)
    const existing = await prescriptionLayoutRepository.listActive(
      auth.clinicId,
    )

    try {
      await prescriptionLayoutRepository.softDeleteAllActive({
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      })

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_RESET,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        changes: {
          before: {
            templates: existing.map((t) => ({ id: t.id, name: t.name })),
          },
          after: { source: "system_default" },
        },
      })
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.PRESCRIPTION_LAYOUT_RESET,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.PRESCRIPTION_LAYOUT,
        ...auditErrorFields(error),
      })
      throw error
    }
  },

  createFromSystemDefault(name = "Padrão"): {
    name: string
    documentModel: typeof DEFAULT_PRESCRIPTION_DOCUMENT_MODEL
  } {
    return {
      name,
      documentModel: structuredClone(DEFAULT_PRESCRIPTION_DOCUMENT_MODEL),
    }
  },
}
