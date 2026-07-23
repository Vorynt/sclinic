"use client"

import { useQuery } from "@tanstack/react-query"

import { professionalsQueries } from "@/modules/professionals/queries/professionals.query"

export function useProfessionalsQuery() {
  return useQuery(professionalsQueries.list())
}

export function useProfessionalsForSchedulingQuery() {
  return useQuery(professionalsQueries.scheduling())
}
