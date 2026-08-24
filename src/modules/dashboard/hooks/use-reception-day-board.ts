"use client"

import { useQuery } from "@tanstack/react-query"

import {
  dashboardQueries,
  type ReceptionDayBoardRange,
} from "@/modules/dashboard/queries/dashboard.query"

export function useReceptionDayBoardQuery(range: ReceptionDayBoardRange) {
  return useQuery(dashboardQueries.receptionDayBoard(range))
}
