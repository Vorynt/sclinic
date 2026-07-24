"use client"

import { useQuery } from "@tanstack/react-query"

import type { ListQueryParams } from "@/hooks/use-list-query-params"
import { professionalsQueries } from "@/modules/professionals/queries/professionals.query"

export function useProfessionalsQuery(
  filters?: ListQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...professionalsQueries.list(filters),
    ...options,
  })
}

export function useProfessionalsForSchedulingQuery(
  filters?: { q?: string },
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...professionalsQueries.scheduling(filters),
    ...options,
  })
}
