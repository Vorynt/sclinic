"use client"

import { useQuery } from "@tanstack/react-query"

import { dashboardQueries } from "@/modules/dashboard/queries/dashboard.query"

export function useOwnerHomeStatsQuery(enabled = true) {
  return useQuery({
    ...dashboardQueries.ownerHomeStats(),
    enabled,
  })
}
