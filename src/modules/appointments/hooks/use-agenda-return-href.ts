"use client"

import { useSearchParams } from "next/navigation"

import {
  agendaLocationFromSearchParams,
  buildAgendaHref,
} from "@/modules/appointments/utils/agenda-href"

/** Agenda href restored from `mode`/`date` carried on the attendance URL. */
export function useAgendaReturnHref(): string {
  const searchParams = useSearchParams()
  return buildAgendaHref(agendaLocationFromSearchParams(searchParams))
}
