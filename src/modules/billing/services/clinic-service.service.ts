import { Permission } from "@/config/permissions";
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from "@/modules/audit/constants/audit";
import { auditErrorFields, recordAudit } from "@/modules/audit/emit";
import { auditActorFromAuth } from "@/modules/audit/utils/audit-actor";
import {
  requireAnyPermission,
  requirePermission,
} from "@/modules/authentication/permissions/guards";
import type { CreateClinicServiceDto } from "@/modules/billing/dto/create-clinic-service.dto";
import type { ListActiveClinicServicesDto } from "@/modules/billing/dto/list-active-clinic-services.dto";
import type { ListClinicServicesDto } from "@/modules/billing/dto/list-clinic-services.dto";
import type { UpdateClinicServiceDto } from "@/modules/billing/dto/update-clinic-service.dto";
import { clinicServiceRepository } from "@/modules/billing/repositories/clinic-service.repository";
import type { ClinicService } from "@/modules/billing/types/clinic-service";
import type { AuthRequestContext } from "@/shared/auth";
import { AppError, ErrorCode } from "@/shared/errors";
import type { PaginatedResult } from "@/types/pagination";

const FINANCIAL_READ = [
  Permission.FINANCIAL_VIEW,
  Permission.FINANCIAL_COLLECT,
  Permission.FINANCIAL_MANAGE,
] as const;

function clinicServiceSnapshot(service: ClinicService) {
  return {
    id: service.id,
    name: service.name,
    description: service.description ?? null,
    priceCents: service.priceCents,
    currency: service.currency,
    isActive: service.isActive,
  };
}

export const clinicServiceService = {
  async list(
    filters: ListClinicServicesDto,
    ctx: AuthRequestContext,
  ): Promise<PaginatedResult<ClinicService>> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_READ);
    return clinicServiceRepository.listByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
      isActive: filters.isActive,
      page: filters.page,
      pageSize: filters.pageSize,
    });
  },

  async listActive(
    filters: ListActiveClinicServicesDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicService[]> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_READ);
    return clinicServiceRepository.listActiveByClinic({
      clinicId: auth.clinicId,
      q: filters.q,
    });
  },

  async getById(id: string, ctx: AuthRequestContext): Promise<ClinicService> {
    const auth = await requireAnyPermission(ctx, ...FINANCIAL_READ);

    const service = await clinicServiceRepository.findById(id, auth.clinicId);
    if (!service) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Serviço não encontrado.",
      });
    }

    return service;
  },

  async create(
    data: CreateClinicServiceDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicService> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_MANAGE);
    const actor = auditActorFromAuth(auth);

    try {
      const service = await clinicServiceRepository.create({
        clinicId: auth.clinicId,
        createdBy: auth.user.id,
        data,
      });

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_SERVICE_CREATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_SERVICE,
        entityId: service.id,
        changes: { after: clinicServiceSnapshot(service) },
      });

      return service;
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_SERVICE_CREATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_SERVICE,
        changes: { after: { name: data.name, priceCents: data.priceCents } },
        ...auditErrorFields(error),
      });
      throw error;
    }
  },

  async update(
    data: UpdateClinicServiceDto,
    ctx: AuthRequestContext,
  ): Promise<ClinicService> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_MANAGE);
    const actor = auditActorFromAuth(auth);
    const { id, ...rest } = data;

    const existing = await clinicServiceRepository.findById(id, auth.clinicId);
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Serviço não encontrado.",
      });
    }

    try {
      const service = await clinicServiceRepository.update({
        id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
        data: rest,
      });

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_SERVICE_UPDATE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_SERVICE,
        entityId: service.id,
        changes: {
          before: clinicServiceSnapshot(existing),
          after: clinicServiceSnapshot(service),
        },
      });

      return service;
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_SERVICE_UPDATE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_SERVICE,
        entityId: id,
        changes: {
          before: clinicServiceSnapshot(existing),
          after: rest,
        },
        ...auditErrorFields(error),
      });
      throw error;
    }
  },

  async delete(id: string, ctx: AuthRequestContext): Promise<void> {
    const auth = await requirePermission(ctx, Permission.FINANCIAL_MANAGE);
    const actor = auditActorFromAuth(auth);

    const existing = await clinicServiceRepository.findById(id, auth.clinicId);
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, {
        message: "Serviço não encontrado.",
      });
    }

    try {
      await clinicServiceRepository.softDelete({
        id,
        clinicId: auth.clinicId,
        updatedBy: auth.user.id,
      });

      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_SERVICE_DELETE,
        status: "success",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_SERVICE,
        entityId: id,
        changes: { before: clinicServiceSnapshot(existing) },
      });
    } catch (error) {
      recordAudit({
        ...actor,
        action: AUDIT_ACTIONS.CLINIC_SERVICE_DELETE,
        status: "error",
        entityType: AUDIT_ENTITY_TYPES.CLINIC_SERVICE,
        entityId: id,
        changes: { before: clinicServiceSnapshot(existing) },
        ...auditErrorFields(error),
      });
      throw error;
    }
  },
};
