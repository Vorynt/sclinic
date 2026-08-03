"use client"

import { useQuery } from "@tanstack/react-query"

import { clinicServicesQueries } from "@/modules/billing/queries/clinic-services.query"
import type {
  ListActiveClinicServicesInput,
  ListClinicServicesInput,
} from "@/modules/billing/schemas/clinic-service.schema"

export function useClinicServicesQuery(
  filters?: ListClinicServicesInput,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...clinicServicesQueries.list(filters),
    ...options,
  })
}

export function useActiveClinicServicesQuery(
  filters?: ListActiveClinicServicesInput,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...clinicServicesQueries.active(filters),
    ...options,
  })
}

/** Alias for appointment / charge pickers. */
export function useActiveClinicServices(
  filters?: ListActiveClinicServicesInput,
  options?: { enabled?: boolean },
) {
  return useActiveClinicServicesQuery(filters, options)
}

export function useClinicServiceQuery(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...clinicServicesQueries.detail(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
  })
}
