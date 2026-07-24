"use client"

import { useQuery } from "@tanstack/react-query"

import type { ListQueryParams } from "@/hooks/use-list-query-params"
import { patientsQueries } from "@/modules/patients/queries/patients.query"

export function usePatientsQuery(
  filters?: ListQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...patientsQueries.list(filters),
    ...options,
  })
}
