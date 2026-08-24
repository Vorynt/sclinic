import { queryOptions } from "@tanstack/react-query"

import { getAdminHomeStatsAction } from "@/modules/dashboard/actions/get-admin-home-stats"
import { getOwnerHomeStatsAction } from "@/modules/dashboard/actions/get-owner-home-stats"
import { getReceptionDayBoardAction } from "@/modules/dashboard/actions/get-reception-day-board"
import type { ReceptionDayBoard } from "@/modules/dashboard/types/home-stats"
import { unwrapActionResult } from "@/shared/errors"
import type { Appointment } from "@/modules/appointments/types/appointment"
import type { Charge } from "@/modules/billing/types/charge"

export type ReceptionDayBoardRange = {
  from: Date
  to: Date
}

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  ownerHomeStats: () =>
    [...dashboardQueryKeys.all, "owner-home-stats"] as const,
  adminHomeStats: () =>
    [...dashboardQueryKeys.all, "admin-home-stats"] as const,
  receptionDayBoards: () =>
    [...dashboardQueryKeys.all, "reception-day-board"] as const,
  receptionDayBoard: (range: ReceptionDayBoardRange) =>
    [
      ...dashboardQueryKeys.receptionDayBoards(),
      {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
    ] as const,
}

function reviveAppointment(row: Appointment): Appointment {
  return {
    ...row,
    startsAt: new Date(row.startsAt),
    endsAt: new Date(row.endsAt),
    canceledAt: row.canceledAt ? new Date(row.canceledAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

function reviveCharge(row: Charge): Charge {
  return {
    ...row,
    dueAt: row.dueAt ? new Date(row.dueAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

function reviveReceptionDayBoard(data: ReceptionDayBoard): ReceptionDayBoard {
  return {
    appointments: data.appointments.map(reviveAppointment),
    charges: data.charges.map(reviveCharge),
  }
}

export const dashboardQueries = {
  ownerHomeStats: () =>
    queryOptions({
      queryKey: dashboardQueryKeys.ownerHomeStats(),
      queryFn: async () =>
        unwrapActionResult(await getOwnerHomeStatsAction()),
    }),

  adminHomeStats: () =>
    queryOptions({
      queryKey: dashboardQueryKeys.adminHomeStats(),
      queryFn: async () =>
        unwrapActionResult(await getAdminHomeStatsAction()),
    }),

  receptionDayBoard: (range: ReceptionDayBoardRange) =>
    queryOptions({
      queryKey: dashboardQueryKeys.receptionDayBoard(range),
      queryFn: async () =>
        reviveReceptionDayBoard(
          unwrapActionResult(await getReceptionDayBoardAction(range)),
        ),
    }),
}
