"use client"

import { useQuery } from "@tanstack/react-query"

import { dashboardQueries } from "@/modules/dashboard/queries/dashboard.query"

export function useAdminHomeStatsQuery() {
  return useQuery(dashboardQueries.adminHomeStats())
}
