import type { ClinicService as ClinicServiceRow } from "@/db/schema"
import type { ClinicService } from "@/modules/billing/types/clinic-service"

export function toClinicService(row: ClinicServiceRow): ClinicService {
  return {
    id: row.id,
    clinicId: row.clinicId,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    currency: row.currency,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
