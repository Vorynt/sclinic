import { queryOptions } from "@tanstack/react-query"

import { getClinicServiceAction } from "@/modules/billing/actions/get-clinic-service"
import { listActiveClinicServicesAction } from "@/modules/billing/actions/list-active-clinic-services"
import { listClinicServicesAction } from "@/modules/billing/actions/list-clinic-services"
import type {
  ListActiveClinicServicesInput,
  ListClinicServicesInput,
} from "@/modules/billing/schemas/clinic-service.schema"
import { unwrapActionResult } from "@/shared/errors"

export const clinicServicesQueryKeys = {
  all: ["clinic-services"] as const,
  lists: () => [...clinicServicesQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...clinicServicesQueryKeys.lists(), filters ?? {}] as const,
  active: (filters?: Record<string, unknown>) =>
    [...clinicServicesQueryKeys.all, "active", filters ?? {}] as const,
  details: () => [...clinicServicesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...clinicServicesQueryKeys.details(), id] as const,
}

export const clinicServicesQueries = {
  list: (filters?: ListClinicServicesInput) =>
    queryOptions({
      queryKey: clinicServicesQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listClinicServicesAction(filters)),
    }),

  active: (filters?: ListActiveClinicServicesInput) =>
    queryOptions({
      queryKey: clinicServicesQueryKeys.active(filters),
      queryFn: async () =>
        unwrapActionResult(await listActiveClinicServicesAction(filters)),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: clinicServicesQueryKeys.detail(id),
      queryFn: async () =>
        unwrapActionResult(await getClinicServiceAction(id)),
    }),
}
